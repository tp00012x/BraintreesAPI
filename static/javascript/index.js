

$(document).ready(function(){

$.get('/token').then(function(data){
    braintree.client.create({
        authorization: data
    },
    function (err, clientInstance) {
        if (err) {
            console.error(err);
            return;
        }

        braintree.hostedFields.create({
            client: clientInstance,
            styles: {
                'input': {
                    'font-size': '14px',

                'font-family': 'helvetica, tahoma, calibri, sans-serif',
                'color': '#3a3a3a'
            },
            ':focus': {
                'color': 'black'
            }
        },
        fields: {
            number: {
                selector: '#card-number',
                placeholder: '4111 1111 1111 1111'
            },
            cvv: {
                selector: '#cvv',
                placeholder: '123'
            },
            expirationMonth: {
                selector: '#expiration-month',
                placeholder: 'MM'
            },
            expirationYear: {
                selector: '#expiration-year',
                placeholder: 'YY'
            },
            postalCode: {
                selector: '#postal-code',
                placeholder: '90210'
            }
        }
    }, function (err, hostedFieldsInstance) {
        if (err) {
            console.error(err);
            return;
        }

        hostedFieldsInstance.on('validityChange', function (event) {
            var field = event.fields[event.emittedBy];

            if (field.isValid) {
                if (event.emittedBy === 'expirationMonth' || event.emittedBy === 'expirationYear') {
                    if (!event.fields.expirationMonth.isValid || !event.fields.expirationYear.isValid) {
                        return;
                    }
                } else if (event.emittedBy === 'number') {
                    $('#card-number').next('span').text('');
                }

                // Apply styling for a valid field
                $(field.container).parents('.form-group').addClass('has-success');
            } else if (field.isPotentiallyValid) {
                // Remove styling  from potentially valid fields
                $(field.container).parents('.form-group').removeClass('has-warning');
                $(field.container).parents('.form-group').removeClass('has-success');
                if (event.emittedBy === 'number') {
                    $('#card-number').next('span').text('');
                }
            } else {
                // Add styling to invalid fields
                $(field.container).parents('.form-group').addClass('has-warning');
                // Add helper text for an invalid card number
                if (event.emittedBy === 'number') {
                    $('#card-number').next('span').text('Looks like this card number has an error.');
                }
            }
        });

        hostedFieldsInstance.on('cardTypeChange', function (event) {
            // Handle a field's change, such as a change in validity or credit card type
            if (event.cards.length === 1) {
                $('#card-type').text(event.cards[0].niceType);
            } else {
                $('#card-type').text('Card');
            }
        });

        $('.panel-body').submit(function (event) {
            event.preventDefault();
            hostedFieldsInstance.tokenize(function (err, payload) {
                if (err) {
                    console.error(err);
                    return;
                }
                payload.firstName = $("#firstname").val();
                payload.lastName = $("#lastname").val();
                payload.amount = $("#amount").val();


                // Submitting payload.nonce to my server
                $.post("/payment", payload).then(function(data){
                    if(data === "true"){
                        //BAD PRACTICE: cross-site scripting.  I'm just putting this here to test it for now.
                        window.location.replace("/receipt?firstname=" + payload.firstName + "&lastname=" + payload.lastName + "&amount=" + payload.amount);
                    } else {
                        alert("Error processing payment");
                    }

                });
            });
        });
    });
    });
});
});