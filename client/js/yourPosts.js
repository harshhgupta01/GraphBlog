let userCookie = getCookie("user_id");
const headDiv = document.getElementById("site-heading");
const postDiv = document.getElementById("post-preview");
function loadContent() {
  if (userCookie.length == 0) {
    $("#exampleModalCenter").modal("show");
  } else {
    queryFetch(`
      query {
          user(id: "${userCookie}") {
              name,
              age, 
              email,
              blogs {
                id,
                title
              }
          }
      }
      `).then((data) => {
      if (data.errors) {
        alert(data.errors[0].message);
      } else {
        console.log(data.data);
        const user = data.data.user;
        headDiv.innerHTML = `
          <h1>${user.name}</h1>
          <span class="subheading">All Blogs from ${user.name}</span>
          `;
        postDiv.innerHTML = "";
        if (user.blogs[0].id != null) {
          user.blogs.forEach((blog) => {
            postDiv.innerHTML += `
                <div class="post-preview">
                <a href="post.html?id=${blog.id}"
                    ><h2 class="post-title">
                    ${blog.title}
                    </h2></a
                >
                <p class="post-meta">
                    Posted by
                    <a href="user.html?id=${userCookie}">${user.name}</a>
                </p>
                </div>
                `;
          });
        } else {
          postDiv.innerHTML = `
          <div class="post-preview">
                <h2 class="post-title">
                    No posts yet
                    </h2>
                </div>
          `;
        }
      }
    });
  }
}

loadContent();

function loadRegisterModal() {
  $("#exampleModalCenter").modal("hide");
  $("#registerModalCenter").modal("show");
}

function register(e) {
  e.preventDefault();
  const registerForm = document.getElementById("registerForm");
  const name = registerForm.elements["name"].value;
  const email = registerForm.elements["email"].value;
  const password = registerForm.elements["password"].value;
  const age = registerForm.elements["age"].value;
  alert(name + age + email + password);
  queryFetch(`
  mutation {
    addUser(name: "${name}", age: ${age}, email: "${email}", password: "${password}") {
      id
    }
  }
  `).then((data) => {
    if (data.errors) {
      alert(data.errors[0].message);
    } else {
      console.log(data.data.addUser.id);
      document.cookie = "user_id=" + data.data.addUser.id;
      userCookie = getCookie("user_id");
      loadContent();
      $("#registerModalCenter").modal("hide");
      registerForm.reset();
    }
  });
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
      userCookie = getCookie("user_id");
      loadContent();
      $("#exampleModalCenter").modal("hide");
      loginForm.reset();
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
