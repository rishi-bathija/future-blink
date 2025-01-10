const Agenda = require('agenda');
const nodemailer = require('nodemailer');
require('dotenv').config();

const agenda = new Agenda({ db: { address: process.env.AGENDADB_URL } });

agenda.on('ready', () => {
    console.log('Agenda is ready and running.');
});

console.log('agenda', agenda)
console.log("Agenda instance imported successfully");


// Define the "send email" job
agenda.define('send email', async (job) => {
    const { email, subject, body } = job.attrs.data;

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: email,
            subject,
            text: body,
        });

        console.log(`Email sent to ${email}`);
    }
    catch (error) {
        console.log(error);
    }
});

agenda.start();


module.exports = agenda;
