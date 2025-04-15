
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

// Node component for our neural network
const Node = ({ position, size = 0.5, color = '#7E3ACE', active, onInteract }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [opacity, setOpacity] = useState(Math.random() * 0.5 + 0.3); // Random opacity between 30-80%
  
  useEffect(() => {
    if (active) {
      setOpacity(0.9);
    } else if (!hovered) {
      setOpacity(Math.random() * 0.5 + 0.3);
    }
  }, [active, hovered]);

  useFrame(() => {
    if (meshRef.current) {
      // Add subtle continuous movement
      meshRef.current.rotation.x += 0.002;
      meshRef.current.rotation.y += 0.003;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => {
        setHovered(true);
        setOpacity(0.9);
        if (onInteract) onInteract(position);
      }}
      onPointerOut={() => {
        setHovered(false);
        if (!active) setOpacity(Math.random() * 0.5 + 0.3);
      }}
    >
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial
        color={color}
        transparent={true}
        opacity={opacity}
        emissive={color}
        emissiveIntensity={hovered || active ? 2 : 1}
      />
    </mesh>
  );
};

// Connection line between nodes
const Connection = ({ start, end, active, color = '#7E3ACE' }) => {
  const ref = useRef<THREE.Line>(null);
  const [opacity, setOpacity] = useState(0.2);
  
  useEffect(() => {
    if (active) {
      setOpacity(0.6);
    } else {
      setOpacity(0.2);
    }
  }, [active]);

  useFrame(() => {
    if (ref.current && ref.current.geometry) {
      // Update the line geometry to connect the start and end points
      const points = [
        new THREE.Vector3(...start),
        new THREE.Vector3(...end)
      ];
      ref.current.geometry.setFromPoints(points);
    }
  });

  return (
    <line ref={ref}>
      <bufferGeometry />
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </line>
  );
};

// Particle system for flowing along connections
const Particles = ({ start, end, active }) => {
  const count = 5;
  const ref = useRef<THREE.Points>(null);
  const [positions, setPositions] = useState(() => {
    const pos = new Float32Array(count * 3);
    return pos;
  });

  useFrame(({ clock }) => {
    if (!active || !ref.current || !ref.current.geometry) return;
    
    const positions = ref.current.geometry.attributes.position.array;
    const time = clock.getElapsedTime();
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const t = ((time + i * 0.1) % 1); // Cycle between 0 and 1
      
      positions[i3] = start[0] + (end[0] - start[0]) * t;
      positions[i3 + 1] = start[1] + (end[1] - start[1]) * t;
      positions[i3 + 2] = start[2] + (end[2] - start[2]) * t;
    }
    
    if (ref.current.geometry.attributes.position) {
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#7E3ACE"
        size={0.1}
        transparent
        opacity={active ? 0.8 : 0}
        sizeAttenuation
      />
    </points>
  );
};

// Main neural network visualization
const NeuralNetworkVisualization = ({ onComplete }) => {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [activeNodes, setActiveNodes] = useState([]);
  const [activeConnections, setActiveConnections] = useState([]);
  const [interactionCount, setInteractionCount] = useState(0);
  const [showKeywords, setShowKeywords] = useState(false);
  const [transforming, setTransforming] = useState(false);
  
  // Generate initial network
  useEffect(() => {
    const nodeCount = 30;
    const newNodes = [];
    
    // Generate random nodes in 3D space
    for (let i = 0; i < nodeCount; i++) {
      newNodes.push({
        id: i,
        position: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10
        ],
        size: Math.random() * 0.3 + 0.2
      });
    }
    
    setNodes(newNodes);
    
    // Generate connections between nearby nodes
    const newConnections = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const distance = calculateDistance(newNodes[i].position, newNodes[j].position);
        if (distance < 5) {
          newConnections.push({
            id: `${i}-${j}`,
            start: newNodes[i].position,
            end: newNodes[j].position
          });
        }
      }
    }
    
    setConnections(newConnections);
  }, []);
  
  // Calculate distance between two points
  const calculateDistance = (p1, p2) => {
    return Math.sqrt(
      Math.pow(p2[0] - p1[0], 2) +
      Math.pow(p2[1] - p1[1], 2) +
      Math.pow(p2[2] - p1[2], 2)
    );
  };
  
  // Handle node interaction
  const handleNodeInteract = (position) => {
    // Find nearby nodes
    const nearbyNodes = nodes.filter(node => 
      calculateDistance(node.position, position) < 4 &&
      node.position !== position
    );
    
    // Set active nodes
    setActiveNodes(prev => {
      const currentActive = [...prev];
      const positionStr = position.toString();
      
      // Add the interacted node if not already active
      if (!currentActive.some(pos => pos.toString() === positionStr)) {
        currentActive.push(position);
      }
      
      // Add nearby nodes
      nearbyNodes.forEach(node => {
        const nodeStr = node.position.toString();
        if (!currentActive.some(pos => pos.toString() === nodeStr)) {
          currentActive.push(node.position);
        }
      });
      
      return currentActive;
    });
    
    // Set active connections
    setActiveConnections(prev => {
      const currentActive = [...prev];
      
      // Find connections involving the active node
      connections.forEach(conn => {
        const startStr = conn.start.toString();
        const endStr = conn.end.toString();
        const posStr = position.toString();
        
        if ((startStr === posStr || endStr === posStr) &&
            !currentActive.some(c => c.start.toString() === conn.start.toString() && 
                                 c.end.toString() === conn.end.toString())) {
          currentActive.push(conn);
        }
      });
      
      return currentActive;
    });
    
    // Increment interaction count
    setInteractionCount(prev => {
      const newCount = prev + 1;
      
      // Show keywords after enough interactions
      if (newCount >= 5 && !showKeywords) {
        setShowKeywords(true);
      }
      
      // Start transformation after more interactions
      if (newCount >= 15 && !transforming) {
        setTransforming(true);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 3000);
      }
      
      return newCount;
    });
  };

  return (
    <>
      {nodes.map(node => (
        <Node
          key={node.id}
          position={node.position}
          size={node.size}
          active={activeNodes.some(pos => pos.toString() === node.position.toString())}
          onInteract={handleNodeInteract}
        />
      ))}
      
      {connections.map(conn => (
        <Connection
          key={conn.id}
          start={conn.start}
          end={conn.end}
          active={activeConnections.some(c => 
            c.start.toString() === conn.start.toString() && 
            c.end.toString() === conn.end.toString()
          )}
        />
      ))}
      
      {activeConnections.map(conn => (
        <Particles
          key={`particle-${conn.id}`}
          start={conn.start}
          end={conn.end}
          active={true}
        />
      ))}
      
      {showKeywords && (
        <>
          <Text
            position={[3, 2, 0]}
            fontSize={0.8}
            color="#7E3ACE"
            anchorX="center"
            anchorY="middle"
            material-transparent={true}
            material-opacity={transforming ? 0.8 : 0.5}
          >
            Automate
          </Text>
          <Text
            position={[-3, -2, 1]}
            fontSize={0.8}
            color="#7E3ACE"
            anchorX="center"
            anchorY="middle"
            material-transparent={true}
            material-opacity={transforming ? 0.8 : 0.5}
          >
            Optimize
          </Text>
          <Text
            position={[0, 3, -2]}
            fontSize={0.8}
            color="#7E3ACE"
            anchorX="center"
            anchorY="middle"
            material-transparent={true}
            material-opacity={transforming ? 0.8 : 0.5}
          >
            Analyze
          </Text>
          <Text
            position={[-2, 0, 3]}
            fontSize={0.8}
            color="#7E3ACE"
            anchorX="center"
            anchorY="middle"
            material-transparent={true}
            material-opacity={transforming ? 0.8 : 0.5}
          >
            Connect
          </Text>
        </>
      )}
    </>
  );
};

const NeuralNetwork = () => {
  const [interactionComplete, setInteractionComplete] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const [muted, setMuted] = useState(true);
  
  useEffect(() => {
    // Show skip button after a delay
    const timeout = setTimeout(() => {
      setShowSkip(true);
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, []);
  
  const handleComplete = () => {
    setInteractionComplete(true);
    // Play sound effect if not muted
    if (!muted) {
      // Sound implementation would go here
    }
  };
  
  return (
    <div className="w-full h-full relative">
      <Canvas className="w-full h-full" camera={{ position: [0, 0, 15], fov: 60 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <NeuralNetworkVisualization onComplete={handleComplete} />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
      
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <h1 className="text-4xl font-sans font-bold text-white mb-2 drop-shadow-lg">
          Cogniflow
        </h1>
        <p className="text-sm text-gray-300 mb-8">Shape your workflow - watch intelligence adapt</p>
        
        {interactionComplete && (
          <button 
            className="mt-8 px-8 py-3 bg-[#7E3ACE] text-white rounded-md shadow-lg hover:bg-[#6930A8] transition-colors"
          >
            Enter
          </button>
        )}
      </div>
      
      {showSkip && !interactionComplete && (
        <button 
          className="absolute bottom-4 right-4 text-xs text-gray-400 hover:text-white"
          onClick={() => setInteractionComplete(true)}
        >
          Skip Animation
        </button>
      )}
      
      <button 
        className="absolute top-4 right-4 text-gray-400 hover:text-white"
        onClick={() => setMuted(!muted)}
      >
        {muted ? "🔇" : "🔊"}
      </button>
      
      {interactionComplete && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <div className="h-1 w-48 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full w-full bg-[#7E3ACE] animate-pulse rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NeuralNetwork;
