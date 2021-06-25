const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const id = urlParams.get("id");

const headDiv = document.getElementById("site-heading");
const postDiv = document.getElementById("post-preview");

queryFetch(`
query {
    user(id: "${id}") {
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
    const user = data.data.user;
    headDiv.innerHTML = `
  <h1>${user.name}</h1>
  <span class="subheading">All Blogs from ${user.name}</span>
  `;
    postDiv.innerHTML = "";
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
            <a href="user.html?id=${id}">${user.name}</a>
        </p>
        </div>
        `;
    });
  }
});

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
