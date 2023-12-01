$(document).ready(function() {
    $("#animatebutton").click(function() {
        $(this).toggleClass('clicked'); // Toggle the 'clicked' class on the button
        const element = $('#animatebutton'); // Select the button by its ID
        element.addClass('animated pulse'); // Add the classes animated and pulse for animation
        setTimeout(function() {
            element.removeClass('pulse'); // Remove the pulse class after 1 second
        }, 1000);

        setTimeout(function() {
            window.location.href = 'game.html'; 
        }, 10);
    });
});
