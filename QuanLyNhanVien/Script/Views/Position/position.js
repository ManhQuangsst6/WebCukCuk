class position {
    constructor(pos){
        let me=this;
        me.grid=$(`.${pos}`);
        me.getData();
    }
    getData(){
        let me=this,
        url="http://localhost:5086/api/v1/Positions",
        method=Resource.Method.Get
        CommonFn.Ajax(url,method,{},response=>{
            if(response){
                me.renderData(response);
            }
            else
                console("error server");
        })
         
    }

    renderData(data){
        let me=this;
        if(data){
            data.forEach(item => {
                let option=$("<option></option>"),
                key=Object.values(item)[0],
                value=Object.values(item)[2];
                option.text(value);
                option.attr("id",key);
                me.grid.append(option);
            });
        }
    }
}