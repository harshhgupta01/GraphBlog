const postDiv = document.getElementById("post-preview");

queryFetch(`
query {
    blogs {
        id,
        title,
        user {
            id,
            name
        },
        upVotes,
        downVotes
    }
}
`).then((data) => {
  postDiv.innerHTML = "";
  data.data.blogs.forEach((blog) => {
    postDiv.innerHTML += `
      <div class="post-preview">
      <a href="post.html?id=${blog.id}"
        ><h2 class="post-title">
          ${blog.title}
        </h2></a
      >
      <p class="post-meta">
        Posted by
        <a href="user.html?id=${blog.user.id}">${blog.user.name}</a>
      </p>
    </div>
      `;
  });
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
