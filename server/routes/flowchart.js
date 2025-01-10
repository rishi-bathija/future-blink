const express = require("express");
const Flowchart = require("../models/Flowchart");
const router = express.Router();
const agenda = require("../routes/agenda")
// console.log('agenda in flowchart', agenda);


router.post('/save-flowchart', async (req, res) => {
    const { nodes, edges } = req.body;
    try {
        // Save flowchart to database
        const flowchart = new Flowchart({ nodes, edges });
        await flowchart.save();

        // Save flowchart to database
        processFlowchart(nodes, edges);

        return res.status(200).json({
            success: true,
            message: "Flowchart saved and processed successfully!"
        })
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Can't save flowchart"
        })
    }
})

const processFlowchart = async (nodes, edges) => {
    for (const node of nodes) {
        console.log('processFlowchart function called');
        if (node.data.label.includes('Wait')) {
            // extract delay time from node
            const match = node.data.label.match(/\d+/);

            if (!match) {
                console.log(`Invalid Wait node label: ${node.data.label}`);
                return; // Skip processing this node if no number is found
            }

            const delay = parseInt(match[0], 10);

            // Find the next node (email to send)
            const nextEdge = edges.find((edge) => edge.source === node.id);
            const nextNode = nodes.find((n) => n.id === nextEdge?.target);

            console.log('next edge', nextEdge);
            console.log('next node', nextNode);


            if (nextNode && nextNode.data.label.includes('Cold Email')) {
                // Schedule email after the delay
                console.log(`Scheduling email job: Delay ${delay} minutes for node: ${nextNode.data.label}`);

                try {
                    await agenda.schedule(`in ${delay} minutes`, 'send email', {
                        email: 'bathijarishi@gmail.com', // Replace with real recipient email
                        subject: 'Cold Email Subject',
                        body: 'This is the cold email body.'
                    });

                    // Log all jobs currently scheduled
                    const jobs = await agenda.jobs({});
                    console.log('Scheduled Jobs:', jobs);
                } catch (error) {
                    console.log('Error scheduling email job:', error);
                }
            }
        }
    };
}
module.exports = router;