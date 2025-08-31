// Set up AJAX to always send JWT if available
$.ajaxSetup({
  beforeSend: function(xhr) {
    const token = localStorage.getItem('token');
    console.log("before execute",token,xhr)
    if (token) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    }
  },
});

// For native fetch (if you use it)
function authFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  options.headers = options.headers || {};
  if (token) options.headers['Authorization'] = 'Bearer ' + token;
  return fetch(url, options);
}