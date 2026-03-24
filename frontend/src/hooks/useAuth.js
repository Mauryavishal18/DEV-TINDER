import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { addUser } from "../utils/store";

export default function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(s => s.user);
  const [loading, setLoading] = useState(!user);
  useEffect(() => {
    if (user) { setLoading(false); return; }
    axios.get("/profile/view")
      .then(r => { dispatch(addUser(r.data)); setLoading(false); })
      .catch(() => { navigate("/login", { replace: true }); setLoading(false); });
  }, []);
  return { user, loading };
}
