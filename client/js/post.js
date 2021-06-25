const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const id = urlParams.get("id");
let upOrDown = "";

const titleDiv = document.getElementById("post-heading");
const bodyDiv = document.getElementById("post-content");

queryFetch(`
query {
    blog(id: "${id}") {
        title,
        body,
        user {
            id,
            name
        },
        upVotes,
        downVotes
    }
}
`).then((data) => {
  const blog = data.data.blog;
  const userCookie = getCookie("user_id");
  if (userCookie == blog.user.id) {
    titleDiv.innerHTML = `
    <h1>${blog.title}</h1>
    <button id="editBtn" onclick="editBlog()" title="editBlog">
    &#x270f;
    </button>
      <span class="meta">
      Posted by
      <a href="user.html?id=${blog.user.id}">${blog.user.name}</a>
      </span>
    `;
    bodyDiv.innerHTML = `
    <p>${blog.body}</p>
    `;
  } else {
    titleDiv.innerHTML = `
    <h1>${blog.title}</h1>
      <span class="meta">
      Posted by
      <a href="user.html?id=${blog.user.id}">${blog.user.name}</a>
      </span>
    `;
    bodyDiv.innerHTML = `
    <p>${blog.body}</p>
    `;
  }
});

function editBlog() {
  window.location.href = `editPost.html?id=${id}`;
}

function upVote() {
  const userCookie = getCookie("user_id");
  if (userCookie.length == 0) {
    $("#exampleModalCenter").modal("show");
    upOrDown = "up";
  } else {
    queryFetch(`
      mutation {
        upVote(id: "${id}", upVotes: ["${userCookie}"]) {
          upVotes
        }
      }
      `).then((data) => {
      if (data.errors) {
        alert(data.errors[0].message);
      } else {
        alert("Successfully Voted");
      }
    });
  }
}

function downVote() {
  const userCookie = getCookie("user_id");
  if (userCookie.length == 0) {
    $("#exampleModalCenter").modal("show");
    upOrDown = "down";
  } else {
    queryFetch(`
        mutation {
            downVote(id: "${id}", downVotes: ["${userCookie}"]) {
                downVotes
            }
        }
        `).then((data) => {
      if (data.errors) {
        alert(data.errors[0].message);
      } else {
        alert("Successfully Voted");
      }
    });
  }
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function login(e) {
  e.preventDefault();
  const loginForm = document.getElementById("loginForm");
  const email = loginForm.elements["email"].value;
  const password = loginForm.elements["password"].value;
  queryFetch(`
  mutation {
      login(email: "${email}", password: "${password}") {
          id
      }
  }
  `).then((data) => {
    if (data.errors) {
      alert(data.errors[0].message);
    } else {
      document.cookie = "user_id=" + data.data.login.id;
      $("#exampleModalCenter").modal("hide");
      if (upOrDown == "up") {
        upVote();
      } else if (upOrDown == "down") {
        downVote();
      }
    }
  });
}

function queryFetch(query) {
  return fetch("http://localhost:4000/graphql", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      query: query,
    }),
  }).then((res) => res.json());
}
