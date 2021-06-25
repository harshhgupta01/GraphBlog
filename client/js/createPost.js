function postBlog(e) {
  e.preventDefault();
  const blogForm = document.getElementById("blogForm");
  const title = blogForm.elements["title"].value;
  const body = blogForm.elements["body"].value;
  const userCookie = getCookie("user_id");
  if (userCookie.length == 0) {
    $("#exampleModalCenter").modal("show");
  } else {
    queryFetch(`
      mutation {
          createBlog(title: "${title}", body: "${body}", user_id: "${userCookie}") {
              id
          }
      }
      `).then((data) => {
      if (data.errors) {
        alert(data.errors[0].message);
      } else {
        alert(`successfully posted`);
        window.location.href = `post.html?id=${data.data.createBlog.id}`;
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
