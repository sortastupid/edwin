let _n = 2;
let _end = false;
let _posts = {};
const _url = document.URL;
const _exec = _url.match('(/search/|/tagged/)|[/|/#]$');

if (!_exec) _end = true;

const showNext = (args) => {
    const posts_c = args.posts_c;
    if (!_end) {
        let posts = document.createDocumentFragment();
        let ids = new Array();
        for (i = 0; i < _posts.length; i++) {
            posts.appendChild(_posts[i]);
            ids.push(parseInt(_posts[i].id));
        }
        document.querySelectorAll(posts_c)[0].appendChild(posts);
        Tumblr.LikeButton.get_status_by_post_ids(ids);
        getNext(args);
    }
}

const getNext = (args) => {
    const btn_c = args.btn_c;
    const btn_tgl = args.btn_tgl;
    let url = _url.match('/#$') && _url.slice(0, -2) || _url.match('[/|#]$') && _url.slice(0, -1) || _url;
    url = url.concat("/page/").concat(_n);
    getAsync(url, (xml) => {
        let html = document.createElement('div');
        html.innerHTML = xml.trim();
        const posts = html.querySelectorAll(".post")
        const button = btn_c && document.querySelectorAll(btn_c);
        const btn_class = button && button[0].className.split(" ");
        const btn_idx = btn_class && btn_class.indexOf(btn_tgl);
        if (posts.length > 0) {
            _n++;
            _posts = posts;
            if (btn_idx === -1) {
                button[0].className += " " + btn_tgl;
            }
        } else {
            if (btn_idx !== -1) {
                btn_class && btn_class.forEach((cName, idx) => {
                    if (btn_idx !== idx) button[0].className = cName + " ";
                });
            }
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
    const scroll_c = args.scrll_c;
    const auto_enabled = args.auto_enabled;
    let auto_from = args.auto_from;
    let auto_to = args.auto_to;
    let enabled = true;
    if (auto_enabled === "true") {
        if (auto_from === "*" && auto_to === "*") {
            enabled = true;
        } else {
            if (auto_from === "*") auto_from = 0;
            if (auto_to === "*") auto_to = 99999999999;
            enabled = window.innerWidth >= parseFloat(auto_from) && window.innerWidth <= parseFloat(auto_to);
            window.addEventListener("resize", () => {
                enabled = window.innerWidth >= parseFloat(auto_from) && window.innerWidth <= parseFloat(auto_to);
            });
        }
    } else if (auto_enabled === "false") {
        enabled = false;
    }
    const posts = scroll_c === "window" ? window : document.querySelectorAll(scroll_c)[0];
    !_end && posts.addEventListener("scroll", () => {
        const scroll_h = scroll_c === "window" ? window.scrollY : posts.scrollTop;
        const client_h = scroll_c === "window" ? window.innerHeight : posts.clientHeight;
        const max_h = scroll_c === "window" ? document.body.scrollHeight : posts.scrollHeight;
        const h = scroll_h + client_h;
        const end = h - max_h === 0;
        !_end && end && enabled && showNext(args);
    });
}

const setUp = args => {
    window.addEventListener("load", () => {
        !_end && getNext(args);
        setInfiniteScroll(args);
    });
};

const args = {
    scrll_c: document.currentScript.getAttribute("scrll_c"),
    posts_c: document.currentScript.getAttribute("posts_c"),
    btn_c: document.currentScript.getAttribute("btn_c"),
    btn_tgl: document.currentScript.getAttribute("btn_tgl"),
    auto_enabled: document.currentScript.getAttribute("auto_enabled"),
    auto_from: document.currentScript.getAttribute("auto_from"),
    auto_to: document.currentScript.getAttribute("auto_to")
}

setUp(args);