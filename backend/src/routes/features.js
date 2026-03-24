const express = require("express");
const { userAuth } = require("../middleware/auth");
const User = require("../models/user");
const router = express.Router();

// GET notifications
router.get("/notifications", userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("notifications");
    const notifs = (user.notifications||[]).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,50);
    res.json({ data: notifs });
  } catch(err) { res.status(400).json({ message:err.message }); }
});

// Mark all read
router.patch("/notifications/read", userAuth, async (req, res) => {
  try {
    await User.updateOne({ _id:req.user._id }, { $set:{ "notifications.$[].read":true } });
    res.json({ message:"All read" });
  } catch(err) { res.status(400).json({ message:err.message }); }
});

// Unread count
router.get("/notifications/unread-count", userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("notifications");
    const count = (user.notifications||[]).filter(n=>!n.read).length;
    res.json({ count });
  } catch(err) { res.status(400).json({ message:err.message }); }
});

// Record profile view
router.post("/profile/view/:userId", userAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.user._id.toString()) return res.json({ message:"Own profile" });
    const target = await User.findById(userId);
    if (!target) return res.status(404).json({ message:"User not found" });
    const recentView = (target.profileViews||[]).find(v=>v.viewerId?.toString()===req.user._id.toString()&&new Date()-new Date(v.viewedAt)<60*60*1000);
    if (!recentView) {
      target.profileViews = target.profileViews||[];
      target.profileViews.push({ viewerId:req.user._id, viewerName:`${req.user.firstName} ${req.user.lastName||""}`.trim(), viewerAvatar:req.user.photoUrl||"", viewedAt:new Date() });
      target.notifications = target.notifications||[];
      target.notifications.unshift({ type:"view", from:`${req.user.firstName} ${req.user.lastName||""}`.trim(), fromId:req.user._id, fromAvatar:req.user.photoUrl||"", message:`${req.user.firstName} viewed your profile`, read:false, createdAt:new Date() });
      if (target.profileViews.length>200) target.profileViews=target.profileViews.slice(-200);
      if (target.notifications.length>100) target.notifications=target.notifications.slice(0,100);
      await target.save();
      const sn=req.app.get("sendNotification");
      if(sn) sn(userId,{ type:"view", from:req.user.firstName, message:`${req.user.firstName} viewed your profile` });
    }
    res.json({ message:"View recorded" });
  } catch(err) { res.status(400).json({ message:err.message }); }
});

// Profile analytics
router.get("/profile/analytics", userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("profileViews devScore");
    const views = user.profileViews||[];
    const now = new Date();
    const byDay = {};
    for(let i=29;i>=0;i--){ const d=new Date(now); d.setDate(d.getDate()-i); byDay[d.toISOString().split("T")[0]]=0; }
    views.forEach(v=>{ const k=new Date(v.viewedAt).toISOString().split("T")[0]; if(byDay[k]!==undefined) byDay[k]++; });
    res.json({
      totalViews:views.length,
      todayViews:byDay[now.toISOString().split("T")[0]]||0,
      weekViews:views.filter(v=>new Date()-new Date(v.viewedAt)<7*24*60*60*1000).length,
      byDay,
      recentViewers:views.slice(-10).reverse().map(v=>({ name:v.viewerName, avatar:v.viewerAvatar, time:v.viewedAt })),
      devScore:user.devScore,
    });
  } catch(err) { res.status(400).json({ message:err.message }); }
});

// Leaderboard
router.get("/leaderboard", userAuth, async (req, res) => {
  try {
    const users = await User.find({}).select("firstName lastName photoUrl useAvatar avatarSeed skills devScore githubStats leetcodeStats github").sort({ devScore:-1 }).limit(50);
    res.json({ data:users });
  } catch(err) { res.status(400).json({ message:err.message }); }
});

// Recalculate dev score
router.post("/dev-score/recalculate", userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    // Force recalculation by marking modified (pre-save hook recalculates devScore)
    user.markModified("skills");
    await user.save();
    res.json({ devScore:user.devScore, message:"Score updated! 🚀" });
  } catch(err) { res.status(400).json({ message:err.message }); }
});

// Get collab projects
router.get("/collab/projects", userAuth, async (req, res) => {
  try {
    const users = await User.find({ "collabProjects.0":{ $exists:true } }).select("firstName lastName photoUrl useAvatar avatarSeed collabProjects devScore");
    const projects=[];
    users.forEach(u=>(u.collabProjects||[]).filter(p=>p.status==="open").forEach(p=>projects.push({ ...p.toObject(), owner:{ _id:u._id, firstName:u.firstName, lastName:u.lastName, photoUrl:u.photoUrl, useAvatar:u.useAvatar, avatarSeed:u.avatarSeed, devScore:u.devScore } })));
    projects.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    res.json({ data:projects });
  } catch(err) { res.status(400).json({ message:err.message }); }
});

// Post project
router.post("/collab/projects", userAuth, async (req, res) => {
  try {
    const { title, description, skills } = req.body;
    if (!title||!description) return res.status(400).json({ message:"Title and description required" });
    req.user.collabProjects=req.user.collabProjects||[];
    req.user.collabProjects.unshift({ title, description, skills:skills||[], status:"open" });
    await req.user.save();
    res.status(201).json({ message:"Project posted!", data:req.user.collabProjects[0] });
  } catch(err) { res.status(400).json({ message:err.message }); }
});

// Apply to project
router.post("/collab/projects/:ownerId/:projectId/apply", userAuth, async (req, res) => {
  try {
    const owner = await User.findById(req.params.ownerId);
    if (!owner) return res.status(404).json({ message:"Owner not found" });
    const project = owner.collabProjects?.id(req.params.projectId);
    if (!project) return res.status(404).json({ message:"Project not found" });
    if (project.applicants?.map(a=>a.toString()).includes(req.user._id.toString())) return res.status(400).json({ message:"Already applied" });
    project.applicants=project.applicants||[];
    project.applicants.push(req.user._id);
    owner.notifications=owner.notifications||[];
    owner.notifications.unshift({ type:"collab", from:`${req.user.firstName} ${req.user.lastName||""}`.trim(), fromId:req.user._id, fromAvatar:req.user.photoUrl||"", message:`${req.user.firstName} applied to "${project.title}"`, read:false, createdAt:new Date() });
    await owner.save();
    const sn=req.app.get("sendNotification");
    if(sn) sn(req.params.ownerId,{ type:"collab", message:`${req.user.firstName} applied to "${project.title}"` });
    res.json({ message:"Application sent!" });
  } catch(err) { res.status(400).json({ message:err.message }); }
});

// Close project
router.patch("/collab/projects/:projectId/close", userAuth, async (req, res) => {
  try {
    const project = req.user.collabProjects?.id(req.params.projectId);
    if (!project) return res.status(404).json({ message:"Not found" });
    project.status="closed"; await req.user.save();
    res.json({ message:"Project closed" });
  } catch(err) { res.status(400).json({ message:err.message }); }
});

// Save theme
router.patch("/user/theme", userAuth, async (req, res) => {
  try {
    const { theme } = req.body;
    if (!["dark","light"].includes(theme)) return res.status(400).json({ message:"Invalid theme" });
    req.user.theme=theme; await req.user.save();
    res.json({ message:"Theme updated", theme });
  } catch(err) { res.status(400).json({ message:err.message }); }
});


// ─── OPEN SOURCE MATCHER ───────────────────────────────────
// Match developers based on shared GitHub languages/topics
router.get("/opensource/matches", userAuth, async (req, res) => {
  try {
    const myLang = req.user.githubStats?.topLanguage;
    const mySkills = req.user.skills || [];
    if (!myLang && mySkills.length === 0) {
      return res.json({ data: [], message: "Connect GitHub or add skills to see matches" });
    }
    const query = { _id: { $ne: req.user._id } };
    const orClauses = [];
    if (myLang) orClauses.push({ "githubStats.topLanguage": myLang });
    if (mySkills.length > 0) orClauses.push({ skills: { $in: mySkills } });
    if (orClauses.length > 0) query.$or = orClauses;
    const users = await User.find(query)
      .select("firstName lastName photoUrl useAvatar avatarSeed skills githubStats leetcodeStats devScore about")
      .sort({ devScore: -1 }).limit(20);
    // Score each match
    const scored = users.map(u => {
      let score = 0;
      if (myLang && u.githubStats?.topLanguage === myLang) score += 40;
      const sharedSkills = (u.skills || []).filter(s => mySkills.includes(s));
      score += sharedSkills.length * 15;
      return { user: u.toObject(), matchScore: Math.min(score, 100), sharedSkills };
    }).sort((a,b) => b.matchScore - a.matchScore);
    res.json({ data: scored });
  } catch(err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;
