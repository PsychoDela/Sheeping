$(document).ready(function() {
    $("#animatebutton").click(function() {
        $(this).toggleClass('clicked'); // Toggle the 'clicked' class on the button
        const element = $('#animatebutton'); // Select the button by its ID
        element.addClass('animated pulse'); // Add the classes animated and pulse for animation
        setTimeout(function() {
            element.removeClass('pulse'); // Remove the pulse class after 1 second
        }, 1000);

        // Redirect to index.html after animation (1 second delay)
        setTimeout(function() {
            window.location.href = 'index.html'; // Redirect to index.html
        }, 10);
    });
});
