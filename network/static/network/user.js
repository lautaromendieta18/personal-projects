document.addEventListener("DOMContentLoaded", () => {
    const username = document.querySelector('#usernameProfile').innerHTML;
    
    const followButton = document.querySelector('#followButton');
    request_user_information(username);

    try {
        followButton.addEventListener('click', (event) => follow_user(event, username));
    } catch {}
})

async function request_user_information(user) {
    let listPosts = [];
    let current_user = null;
    try {
        current_user = document.querySelector('#username').innerHTML;
    } catch {
        current_user = null;
    }
    console.log(current_user);

    await fetch(`/information/${user}`)
    .then(response => response.json())
    .then(result => result.posts.forEach(post => {
        const newPost = document.createElement('div');
        newPost.className = "border p-4";
        newPost.setAttribute("id", `post`)

        const usernamePlace = document.createElement('a')
        usernamePlace.setAttribute("href", `user/${post.username}`);

        const username = document.createElement('h5');
        username.innerHTML = post.username;

        usernamePlace.append(username);
        newPost.append(usernamePlace);

        const bodyDiv = document.createElement('div')

        const body = document.createElement('p');
        body.innerHTML = post.body;
        
        if (post.username == current_user) {
            const edit = document.createElement('button');
            edit.className = "btn btn-link btn-sm";
            edit.innerHTML = "Edit";
            edit.addEventListener("click", (event) => edit_post(event, post.id))

            body.append(edit);
        }

        bodyDiv.append(body);

        newPost.append(bodyDiv);
    
        const timestamp = document.createElement('p');
        timestamp.innerHTML = post.timestamp;
        timestamp.className = "fs-6 fw-light";

        newPost.append(timestamp);

        const likesDiv = document.createElement('div');

        const heartIcon = document.createElement('span');
        if (post.likes.find(username => username == current_user)) {
            heartIcon.className = "fa-solid fa-heart";
        } else {
            heartIcon.className = "fa-regular fa-heart";
        }
        
        if (current_user != null) {
            heartIcon.addEventListener("mouseover", () => heartIcon.style.cursor = "pointer");
            heartIcon.addEventListener("click", (event) => like_post(event, post.id));
        }

        likesDiv.append(heartIcon);

        const likes = document.createElement('p');
        likes.className = "d-inline-block mx-1"
        likes.innerHTML = post.likes.length;

        likes.addEventListener("mouseover", () => likes.style.cursor = "default");

        likesDiv.append(likes);

        newPost.append(likesDiv);
        

        listPosts.push(newPost);
    }))
    console.log(listPosts)
    paginate_posts(listPosts)
}


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


function like_post(event, id) {
    const div = event.target.parentNode;
    const likesPlace = div.querySelector("p");
    let likes = parseInt(div.querySelector("p").innerHTML);
    const csrftoken = getCookie('csrftoken');
    fetch('/like', {
        method: "post",
        headers: {'X-CSRFToken': csrftoken},
        mode: 'same-origin',
        body: JSON.stringify({
            id: id
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.message === "succesfull") {
            likes++;
            likesPlace.innerHTML = likes;
            event.target.className = "fa-solid fa-heart";
        } else if (result.message === "removed") {
            likes--;
            likesPlace.innerHTML = likes;
            event.target.className = "fa-regular fa-heart";
        } else if (result.message === "not logged") {
            let text = document.createElement('p')
            text.innerHTML = 'You are not logged in'
            div.append(text) 
        }
    })
}


function follow_user(event, username) {
    const csrftoken = getCookie('csrftoken');
    const followersPlace = document.querySelector('#followersCount');
    let followersCount = parseInt(document.querySelector('#followersCount').innerHTML);

    fetch(`/follow`, {
        method: "post",
        headers: {'X-CSRFToken': csrftoken},
        mode: 'same-origin',
        body: JSON.stringify({
            username: username
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.message === "unfollow") {
            event.target.className = "btn btn-primary my-3";
            event.target.innerHTML = "Follow"
            followersCount--;
            followersPlace.innerHTML = followersCount;
        } else {
            event.target.className = "btn btn-outline-primary my-3";
            event.target.innerHTML = "Unfollow"
            followersCount++;
            followersPlace.innerHTML = followersCount;
        }
    })
}

let currentPage = 1;
let numberOfPages = 1;
function paginate_posts(list) {
    console.log(list.length);
    const postPlace = document.querySelector("#place-posts");
    const paginationPlace = document.querySelector("#place-pagination");

    numberOfPages += parseInt(((list.length-1) / 10));
    console.log(numberOfPages)
    let currentPost = 0;

    if (numberOfPages > 1) {
        console.log(`${numberOfPages} es mayor que 1`)
        const navPag = document.createElement('nav');
        const paginationList = document.createElement('ul');
        paginationList.className = "pagination";

        const pageItem = document.createElement('li');
        pageItem.className = "page-item";

        const pagePrevious = document.createElement('a');
        pagePrevious.className = "page-link";
        pagePrevious.setAttribute("id", "previous")
        pagePrevious.setAttribute("href", "#");
        pagePrevious.innerHTML = "Previous";

        pagePrevious.addEventListener("click", () => {
            currentPage--;
            load_page(currentPage);
        })

        pageItem.append(pagePrevious);
        paginationList.append(pageItem);

        const pageItem2 = document.createElement('li');
        pageItem2.className = "page-item";

        const pageNext = document.createElement('a');
        pageNext.className = "page-link";
        pageNext.setAttribute("href", "#");
        pageNext.innerHTML = "Next";
        pageNext.setAttribute("id", "next")

        pageNext.addEventListener("click", () => {
            currentPage++;
            load_page(currentPage);
        })

        pageItem2.append(pageNext);
        paginationList.append(pageItem2);
        navPag.append(paginationList);

        for (let i = 0; i < numberOfPages; i++) {
            const limitPost = currentPost + 10;
            
            
            const divPage = document.createElement('div')
            divPage.setAttribute("id", `page-${i+1}`)
            divPage.className = "page"
            for (currentPost; currentPost < limitPost; currentPost++) {
                if (list[currentPost] != undefined) {
                    divPage.append(list[currentPost]);
                }
            }

            divPage.style.display = 'none';
            postPlace.append(divPage);
        }
        paginationPlace.append(paginationList);
        load_page(1);
    } else {
        console.log(`${numberOfPages} es menor o igual que 1`)
        list.forEach(post => postPlace.append(post))
    }
    
}

function load_page(page) {
    console.log(page);
    const nextButton = document.querySelector("#next");
    const previousButton = document.querySelector("#previous");

    if (page === numberOfPages) {
        nextButton.parentNode.className = "page-item disabled"
    } else {
        nextButton.parentNode.className = "page-item"
    }

    if (page === 1) {
        previousButton.parentNode.className = "page-item disabled"
    } else {
        previousButton.parentNode.className = "page-item"
    }

    const pages = document.querySelectorAll(".page");
    pages.forEach(element => element.style.display = "none");

    const selected = document.querySelector(`#page-${page}`);
    selected.style.display = "block";
}