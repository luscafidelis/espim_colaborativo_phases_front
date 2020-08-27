export class Parser {
    getUrlParams(url) {
        var params = {};
        try {
            var query = url.split('?')[1];
            var vars = query.split('&');
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split('=');
                params[pair[0]] = decodeURIComponent(pair[1]);
            }
        }catch(e){
            params['page'] = 1;
        }
        return params;
    }
}