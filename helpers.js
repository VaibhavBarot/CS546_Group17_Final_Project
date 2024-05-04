const exportedHelpers = {
    getBugColor:function (color){
        color = color.toUpperCase();
        switch (color) {
            case "HIGH" : {
                return 'text-bg-danger';
            }
            break;
            case "MEDIUM" : {
                return 'text-bg-warning';
            }
            break;
            case "LOW" : {
                return 'text-bg-success'
            }
            break;
        }
    },
    ternary:function(error){
      return (error) ? true : false
    }
}

export default exportedHelpers;