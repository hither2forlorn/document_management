import { server } from "client/config/server";
import { CLIENT_TOKEN, CLIENT_USER_ID } from "config/values";

function login({ username, password }) {
  if (!username || !password) {
    window.alert("Enter username or password");
    return;
  }
  server
    .post(`/client/signin`, { username, password })
    .then((json) => {
      return json.data;
    })
    .then((json) => {
      const user = json.user;
      if (user.token) {
        localStorage.setItem(CLIENT_TOKEN, user.token);
        localStorage.setItem(CLIENT_USER_ID, user.id);
        window.location.reload();
      } else {
        window.alert(json.message);
      }
    })
    .catch((err) => {
      window.alert("You cannot login to this system!");
    });
}

export { login };
