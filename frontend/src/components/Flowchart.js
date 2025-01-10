import React, { useState, useCallback } from 'react';
import ReactFlow, {
    addEdge,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Modal from 'react-modal';
import axios from 'axios';

// Initial Nodes and Edges
const initialNodes = [
    { id: '1', type: 'input', data: { label: 'Lead Source' }, position: { x: 250, y: 5 } },
];
const initialEdges = [];

const Flowchart = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedNode, setSelectedNode] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [newLabel, setNewLabel] = useState('');

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

    // Open modal for editing a node
    const handleNodeClick = (event, node) => {
        setSelectedNode(node);
        setNewLabel(node.data.label);
        setModalIsOpen(true);
    };

    // Save changes to the node
    const handleSaveNode = () => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === selectedNode.id ? { ...node, data: { ...node.data, label: newLabel } } : node
            )
        );
        setModalIsOpen(false);
        setSelectedNode(null);
    };

    // Delete the selected node
    const handleDeleteNode = () => {
        setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
        setEdges((eds) =>
            eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id)
        );
        setModalIsOpen(false);
        setSelectedNode(null);
    };

    // Add a new node of a specific type
    const handleAddNode = (type) => {
        const id = `${nodes.length + 1}`;
        const newNode = {
            id,
            data: { label: type },
            position: { x: Math.random() * 400, y: Math.random() * 400 }, // Random position
        };
        setNodes((nds) => nds.concat(newNode));
    };

    // Save the workflow to the backend
    const handleSaveWorkflow = async () => {
        const workflowData = { nodes, edges };
        try {
            await axios.post('https://future-blink-backend.vercel.app/api/save-flowchart', workflowData);
            alert('Workflow saved successfully!');
        } catch (err) {
            console.error(err);
            alert('Error saving workflow to the backend.');
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex' }}>
            {/* Sidebar for adding nodes */}
            <div
                style={{
                    width: 200,
                    background: '#f7f7f7',
                    padding: 20,
                    borderRight: '1px solid #ddd',
                }}
            >
                <h4>Add Workflow Steps</h4>
                <button onClick={() => handleAddNode('Cold Email')}>Add Cold Email</button>
                <button onClick={() => handleAddNode('Wait/Delay')}>Add Wait/Delay</button>
                <button onClick={() => handleAddNode('Lead Source')}>Add Lead Source</button>
                <button
                    onClick={handleSaveWorkflow}
                    style={{
                        marginTop: 20,
                        padding: '10px 15px',
                        background: '#007bff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Save Workflow
                </button>
            </div>

            {/* ReactFlow Canvas */}
            <div style={{ flex: 1 }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={handleNodeClick}
                    fitView
                >
                    <MiniMap />
                    <Controls />
                    <Background />
                </ReactFlow>
            </div>

            {/* Modal for editing a node */}
            <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)}>
                <div className='flex flex-col'>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h2>Edit Node</h2>
                        <button
                            onClick={() => setModalIsOpen(false)}
                            style={{
                                padding: '5px 10px',
                                background: 'transparent',
                                borderRadius: '5px',
                                color: '#6c757d',
                                cursor: 'pointer',
                            }}
                        >
                            ✕
                        </button>
                    </div>
                    <input
                        type="text"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        placeholder="Enter new label"
                        style={{ padding: '8px', width: '100%' }}
                    />
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                        <button onClick={handleSaveNode} style={{ padding: '10px', background: '#28a745', color: '#fff' }}>
                            Save
                        </button>
                        <button onClick={handleDeleteNode} style={{ padding: '10px', background: '#dc3545', color: '#fff' }}>
                            Delete Node
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Flowchart;
