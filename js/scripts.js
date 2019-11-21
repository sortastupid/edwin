console.log("woz.js");
let _n = 2;
let _end = false;
let _before = 0;
let _posts = {};
let _mobile;
const _url = document.URL;
const _exec = _url.match('(/search/|/tagged/)|[/|/#]$');

if (!_exec) _end = true;

const showNext = args => {
    const posts_c = args.posts_c;
    if (!_end) {
        const now = new Date();
        const delta = now - _before;
        if (delta > 1000) {
            let posts = document.createDocumentFragment();
            let ids = new Array();
            for (i = 0; i < _posts.length; i++) {
                posts.appendChild(_posts[i]);
                ids.push(parseInt(_posts[i].id));
            }
            document.querySelectorAll(posts_c)[0].appendChild(posts);
            Tumblr.LikeButton.get_status_by_post_ids(ids);
            getNext(args);
        } else if (_end) {
            $('#load-more').css("display", "none");
            $('#the-end').css("display", "flex");
        }
        before = now;
    }
}

const getNext = args => {
    const { button_c, end_c } = args;
    let url = _url.match('/#$') && _url.slice(0, -2) || _url.match('[/|#]$') && _url.slice(0, -1) || _url;
    url = url.concat("/page/").concat(_n);
    getAsync(url, (xml) => {
        let html = document.createElement('div');
        html.innerHTML = xml.trim();
        const posts = html.querySelectorAll(".post")
        if (posts.length > 0) {
            _n++;
            _posts = posts;
            $(button_c).css("display", "flex");
        } else {
            $(button_c).css("display", "none");
            $(end_c).css("display", "flex");
            _end = true;
        }
    });
}

const getAsync = (url, callback) => {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = () => {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            callback(xmlHttp.responseText);
        }
    }
    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
}

const setInfiniteScroll = args => {
    !_end && getNext(args);
    const scroll_c = args.scroll_c;
    window.addEventListener("load", () => {
        const posts = scroll_c === "window" ? window : document.querySelectorAll(scroll_c)[0];
        posts.addEventListener("scroll", () => {
            const h = posts.scrollTop + posts.clientHeight;
            const maxh = posts.scrollHeight;
            const end = h - maxh === 0;
            end && showNext(args);
        });
    });
};

const args = {
    scroll_c: document.currentScript.getAttribute("scroll_c"),
    posts_c: document.currentScript.getAttribute("posts_c"),
    button_c: document.currentScript.getAttribute("button_c"),
    end_c: document.currentScript.getAttribute("end_c")
}
console.log(args);
setInfiniteScroll(args);