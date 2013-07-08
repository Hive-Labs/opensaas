var emailTemplates = require('email-templates'),
    nodemailer     = require('nodemailer');

var settings = require('../config.json');


// A function for sending email to an account from a configured email address
// and email template.
// @param template          the template to send to the user
// @param templateData      an object containing the data sent to the 
//      template must include:
//        sender      - the sender name mapping to a valid sender in the config,
//        to          - email address to send the message to,
//        subject     - the email subject
module.export = function (template, templateData) {
  emailTemplates(settings.email.emailTemplateFolder, function(err, template) {
    if(err) {
      console.log(err);
    } else {
      var selectedSender = settings.email.serverAddresses[templateData.sender];

      var transport = 
          nodemailer.createTransport(selectedSender.deliveryMethod,
                                     selectedSender.deliverySettings);

      template(template, templateData, function(err, html, text) {
        if(err) {
          console.log(err);
        } else {
          transport.sendMail({
            from: selectedSender.displayName + ' <' + selectedSender.fromAddress + '>', 
            to: templateData.to, 
            subject: templateData.subject,
            html: html,
            text: text
          }, function(err, responseStatus) {
            if(err) {
              console.log(err);
            } else {
              console.log(responseStatus.message);
            }
          });
        }
      });
    }
  });
};
