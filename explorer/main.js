document.addEventListener('DOMContentLoaded', function () {
    // Fetch JSON data
    fetch('http://45.76.136.11:8000/info/keylist')
        .then(response => response.json())
        .then(data => {
            // Display JSON data in a <pre> tag
            document.getElementById('json-display').textContent = JSON.stringify(data, null, 2);
        })
        .catch(error => console.error('Error fetching data:', error));
});
