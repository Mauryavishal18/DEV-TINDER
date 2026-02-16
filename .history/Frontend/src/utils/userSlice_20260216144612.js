const userSlice=createSlice({
    name:"user",
    initialState:null,
    reducers:{
        addUser : (state,action)=>{
            return action.payload;
        },
        removeUser:(state,action)
    }
})