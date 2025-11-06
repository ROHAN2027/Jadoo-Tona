import mongoose from 'mongoose';
import ConceptualQuestion from './models/conceptualQuestion.model.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/jadutona';

const conceptualQuestions = [
  // Operating Systems - Easy
  {
    category: 'Operating Systems',
    difficulty: 'Easy',
    topic: 'Process vs Thread',
    question: 'What is the difference between a process and a thread?',
    expectedKeyPoints: [
      'Process has separate memory space',
      'Threads share memory within a process',
      'Context switching is faster for threads',
      'Processes are more isolated',
      'Threads enable concurrent execution'
    ],
    sampleAnswer: 'A process is an independent program in execution with its own memory space, while a thread is a lightweight unit of execution within a process that shares memory with other threads. Context switching between threads is faster than between processes because threads share the same address space.',
    tags: ['process', 'thread', 'concurrency', 'basics']
  },
  {
    category: 'Operating Systems',
    difficulty: 'Easy',
    topic: 'Virtual Memory',
    question: 'What is virtual memory and why is it useful?',
    expectedKeyPoints: [
      'Abstraction of physical memory',
      'Allows programs larger than RAM',
      'Memory protection between processes',
      'Uses disk storage as extension',
      'Enables efficient memory management'
    ],
    sampleAnswer: 'Virtual memory is a memory management technique that creates an illusion of a large contiguous memory space by using both RAM and disk storage. It allows programs to run even when they require more memory than physically available and provides memory protection between processes.',
    tags: ['memory', 'virtual-memory', 'basics']
  },
  
  // Operating Systems - Medium
  {
    category: 'Operating Systems',
    difficulty: 'Medium',
    topic: 'Deadlock',
    question: 'Explain deadlock and the conditions required for it to occur.',
    expectedKeyPoints: [
      'Mutual exclusion',
      'Hold and wait',
      'No preemption',
      'Circular wait',
      'All four conditions must be present'
    ],
    sampleAnswer: 'Deadlock is a situation where processes are blocked forever because each process holds resources and waits for other resources held by other processes. Four conditions must simultaneously hold: mutual exclusion (resources cannot be shared), hold and wait (processes hold resources while waiting), no preemption (resources cannot be forcibly taken), and circular wait (circular chain of processes waiting for resources).',
    tags: ['deadlock', 'synchronization', 'resource-management']
  },
  {
    category: 'Operating Systems',
    difficulty: 'Medium',
    topic: 'Paging',
    question: 'How does paging work in operating systems?',
    expectedKeyPoints: [
      'Memory divided into fixed-size pages',
      'Physical memory divided into frames',
      'Page table maps virtual to physical addresses',
      'Eliminates external fragmentation',
      'Enables non-contiguous memory allocation'
    ],
    sampleAnswer: 'Paging divides virtual memory into fixed-size blocks called pages and physical memory into frames of the same size. The OS maintains a page table that maps virtual page numbers to physical frame numbers. This allows non-contiguous memory allocation and eliminates external fragmentation.',
    tags: ['paging', 'memory-management', 'virtual-memory']
  },
  
  // Operating Systems - Hard
  {
    category: 'Operating Systems',
    difficulty: 'Hard',
    topic: 'Page Replacement Algorithms',
    question: 'Compare different page replacement algorithms and their trade-offs.',
    expectedKeyPoints: [
      'FIFO - simple but can cause Belady\'s anomaly',
      'LRU - optimal but expensive to implement',
      'Optimal - best but requires future knowledge',
      'Clock/Second Chance - practical compromise',
      'Trade-off between performance and complexity'
    ],
    sampleAnswer: 'Page replacement algorithms differ in performance and implementation complexity. FIFO is simple but suffers from Belady\'s anomaly. LRU (Least Recently Used) performs well but requires tracking access times. Optimal algorithm is theoretical best but impractical. Clock/Second Chance provides good balance with reasonable overhead.',
    tags: ['page-replacement', 'algorithms', 'memory-management']
  },
  
  // Networks - Easy
  {
    category: 'Networks',
    difficulty: 'Easy',
    topic: 'TCP vs UDP',
    question: 'What are the key differences between TCP and UDP?',
    expectedKeyPoints: [
      'TCP is connection-oriented, UDP is connectionless',
      'TCP guarantees delivery, UDP does not',
      'TCP has error checking and retransmission',
      'UDP is faster with lower overhead',
      'Different use cases (streaming vs file transfer)'
    ],
    sampleAnswer: 'TCP is connection-oriented and provides reliable, ordered delivery with error checking and retransmission. UDP is connectionless, faster, with no delivery guarantees. TCP is used for applications needing reliability like web browsing, while UDP is used for real-time applications like video streaming.',
    tags: ['tcp', 'udp', 'protocols', 'networking-basics']
  },
  {
    category: 'Networks',
    difficulty: 'Easy',
    topic: 'HTTP vs HTTPS',
    question: 'What is the difference between HTTP and HTTPS?',
    expectedKeyPoints: [
      'HTTPS uses encryption (TLS/SSL)',
      'HTTPS provides data security',
      'HTTPS authenticates server identity',
      'HTTPS protects against man-in-the-middle attacks',
      'HTTPS uses port 443, HTTP uses port 80'
    ],
    sampleAnswer: 'HTTPS is HTTP with encryption using TLS/SSL protocols. It encrypts data in transit, authenticates the server, and protects against eavesdropping and tampering. HTTPS uses port 443 while HTTP uses port 80.',
    tags: ['http', 'https', 'security', 'protocols']
  },
  
  // Networks - Medium
  {
    category: 'Networks',
    difficulty: 'Medium',
    topic: 'DNS Resolution',
    question: 'Explain how DNS resolution works.',
    expectedKeyPoints: [
      'Client queries local DNS resolver',
      'Recursive queries to root, TLD, authoritative servers',
      'Caching at multiple levels',
      'Returns IP address for domain name',
      'Hierarchical system'
    ],
    sampleAnswer: 'DNS resolution converts domain names to IP addresses through a hierarchical process. The client queries a local DNS resolver, which recursively queries root nameservers, then TLD (top-level domain) servers, and finally authoritative nameservers. Results are cached at multiple levels for efficiency.',
    tags: ['dns', 'networking', 'protocols']
  },
  {
    category: 'Networks',
    difficulty: 'Medium',
    topic: 'Load Balancing',
    question: 'What is load balancing and what algorithms can be used?',
    expectedKeyPoints: [
      'Distributes traffic across multiple servers',
      'Round robin algorithm',
      'Least connections',
      'IP hash',
      'Improves availability and scalability'
    ],
    sampleAnswer: 'Load balancing distributes incoming traffic across multiple servers to improve availability and performance. Common algorithms include round robin (sequential distribution), least connections (sends to server with fewest active connections), and IP hash (consistent routing based on client IP). This prevents server overload and provides fault tolerance.',
    tags: ['load-balancing', 'scalability', 'architecture']
  },
  
  // Networks - Hard
  {
    category: 'Networks',
    difficulty: 'Hard',
    topic: 'TCP Congestion Control',
    question: 'How does TCP congestion control work?',
    expectedKeyPoints: [
      'Slow start phase',
      'Congestion avoidance',
      'Fast retransmit and fast recovery',
      'Congestion window (cwnd)',
      'Prevents network congestion'
    ],
    sampleAnswer: 'TCP congestion control uses algorithms to prevent network congestion. It starts with slow start, exponentially increasing the congestion window. After reaching a threshold, it enters congestion avoidance with linear growth. On packet loss, it uses fast retransmit and fast recovery to quickly respond without full slowdown.',
    tags: ['tcp', 'congestion-control', 'algorithms', 'advanced']
  },
  
  // DBMS - Easy
  {
    category: 'DBMS',
    difficulty: 'Easy',
    topic: 'Primary Key',
    question: 'What is a primary key and why is it important?',
    expectedKeyPoints: [
      'Uniquely identifies each record',
      'Cannot be NULL',
      'Must be unique',
      'Used for relationships between tables',
      'Creates index automatically'
    ],
    sampleAnswer: 'A primary key is a column or set of columns that uniquely identifies each row in a table. It cannot contain NULL values and must be unique. Primary keys are essential for maintaining data integrity and establishing relationships between tables through foreign keys.',
    tags: ['primary-key', 'database', 'basics']
  },
  {
    category: 'DBMS',
    difficulty: 'Easy',
    topic: 'SQL Joins',
    question: 'Explain different types of SQL joins.',
    expectedKeyPoints: [
      'INNER JOIN - matching rows from both tables',
      'LEFT JOIN - all from left, matching from right',
      'RIGHT JOIN - all from right, matching from left',
      'FULL OUTER JOIN - all rows from both tables',
      'CROSS JOIN - cartesian product'
    ],
    sampleAnswer: 'SQL joins combine rows from multiple tables. INNER JOIN returns only matching rows. LEFT JOIN returns all rows from left table and matching rows from right. RIGHT JOIN is opposite. FULL OUTER JOIN returns all rows from both tables. CROSS JOIN returns cartesian product of both tables.',
    tags: ['sql', 'joins', 'queries']
  },
  
  // DBMS - Medium
  {
    category: 'DBMS',
    difficulty: 'Medium',
    topic: 'Indexing',
    question: 'How do database indexes work and what are their trade-offs?',
    expectedKeyPoints: [
      'Data structure for fast lookups (B-tree, Hash)',
      'Speeds up read queries',
      'Slows down write operations',
      'Consumes additional storage',
      'Should be used strategically'
    ],
    sampleAnswer: 'Database indexes are data structures (typically B-trees or hash tables) that speed up data retrieval by maintaining a sorted reference to table data. They significantly improve SELECT query performance but slow down INSERT, UPDATE, and DELETE operations because indexes must be updated. They also consume additional storage.',
    tags: ['indexing', 'performance', 'database-optimization']
  },
  {
    category: 'DBMS',
    difficulty: 'Medium',
    topic: 'ACID Properties',
    question: 'Explain ACID properties in database transactions.',
    expectedKeyPoints: [
      'Atomicity - all or nothing',
      'Consistency - valid state transitions',
      'Isolation - concurrent transactions don\'t interfere',
      'Durability - committed data persists',
      'Ensures data integrity'
    ],
    sampleAnswer: 'ACID properties ensure reliable database transactions. Atomicity means transactions complete fully or not at all. Consistency ensures database moves from one valid state to another. Isolation prevents concurrent transactions from interfering. Durability guarantees committed transactions persist even after system failure.',
    tags: ['acid', 'transactions', 'database-fundamentals']
  },
  
  // DBMS - Hard
  {
    category: 'DBMS',
    difficulty: 'Hard',
    topic: 'Database Normalization',
    question: 'Explain database normalization and its normal forms.',
    expectedKeyPoints: [
      '1NF - atomic values, no repeating groups',
      '2NF - 1NF + no partial dependencies',
      '3NF - 2NF + no transitive dependencies',
      'BCNF - 3NF + every determinant is candidate key',
      'Reduces redundancy and anomalies'
    ],
    sampleAnswer: 'Normalization organizes data to reduce redundancy. 1NF requires atomic values and no repeating groups. 2NF eliminates partial dependencies on composite keys. 3NF removes transitive dependencies. BCNF ensures every determinant is a candidate key. Each level reduces data anomalies but may increase join complexity.',
    tags: ['normalization', 'database-design', 'schema']
  },
  
  // System Design - Easy
  {
    category: 'System Design',
    difficulty: 'Easy',
    topic: 'Scalability',
    question: 'What is the difference between horizontal and vertical scaling?',
    expectedKeyPoints: [
      'Vertical scaling - add more power to existing machine',
      'Horizontal scaling - add more machines',
      'Horizontal is more scalable and fault-tolerant',
      'Vertical has hardware limits',
      'Horizontal requires load balancing'
    ],
    sampleAnswer: 'Vertical scaling means adding more resources (CPU, RAM) to a single machine, while horizontal scaling means adding more machines. Vertical scaling has hardware limits and single point of failure. Horizontal scaling is more scalable, fault-tolerant, but requires load balancing and distributed system complexity.',
    tags: ['scalability', 'architecture', 'basics']
  },
  {
    category: 'System Design',
    difficulty: 'Easy',
    topic: 'Caching',
    question: 'What is caching and why is it important?',
    expectedKeyPoints: [
      'Stores frequently accessed data in fast storage',
      'Reduces database load',
      'Improves response time',
      'Can be at multiple levels (CDN, application, database)',
      'Requires cache invalidation strategy'
    ],
    sampleAnswer: 'Caching stores frequently accessed data in fast storage (usually memory) to reduce database queries and improve response times. It can be implemented at multiple levels including CDN, application layer, and database. Effective caching requires proper cache invalidation and eviction policies.',
    tags: ['caching', 'performance', 'optimization']
  },
  
  // System Design - Medium
  {
    category: 'System Design',
    difficulty: 'Medium',
    topic: 'Microservices vs Monolith',
    question: 'Compare microservices and monolithic architectures.',
    expectedKeyPoints: [
      'Monolith - single deployable unit',
      'Microservices - independent services',
      'Microservices enable independent scaling and deployment',
      'Monolith simpler initially but harder to scale',
      'Trade-offs in complexity, communication, and maintenance'
    ],
    sampleAnswer: 'Monolithic architecture is a single unified application, while microservices split functionality into independent services. Microservices enable independent scaling, deployment, and technology choices but increase operational complexity and require service communication. Monoliths are simpler initially but can become difficult to maintain and scale.',
    tags: ['microservices', 'architecture', 'design-patterns']
  },
  {
    category: 'System Design',
    difficulty: 'Medium',
    topic: 'Message Queues',
    question: 'What are message queues and when would you use them?',
    expectedKeyPoints: [
      'Asynchronous communication between services',
      'Decouples producers and consumers',
      'Provides buffering and load leveling',
      'Enables retry and dead letter queues',
      'Examples: RabbitMQ, Kafka, SQS'
    ],
    sampleAnswer: 'Message queues enable asynchronous communication between services by buffering messages. They decouple producers from consumers, provide load leveling, and allow services to process at their own pace. Useful for handling spiky traffic, ensuring reliable delivery, and enabling event-driven architectures.',
    tags: ['message-queues', 'async', 'architecture']
  },
  
  // System Design - Hard
  {
    category: 'System Design',
    difficulty: 'Hard',
    topic: 'CAP Theorem',
    question: 'Explain the CAP theorem and its implications for distributed systems.',
    expectedKeyPoints: [
      'Consistency, Availability, Partition tolerance',
      'Can only guarantee two of three',
      'Network partitions are inevitable',
      'Must choose between CP or AP',
      'Different systems make different trade-offs'
    ],
    sampleAnswer: 'CAP theorem states that distributed systems can only guarantee two of three properties: Consistency (all nodes see same data), Availability (system always responds), and Partition tolerance (works despite network failures). Since network partitions are inevitable, systems must choose between CP (sacrifice availability) or AP (sacrifice strong consistency).',
    tags: ['cap-theorem', 'distributed-systems', 'theory']
  },
  
  // Data Structures - Easy
  {
    category: 'Data Structures',
    difficulty: 'Easy',
    topic: 'Array vs Linked List',
    question: 'What are the differences between arrays and linked lists?',
    expectedKeyPoints: [
      'Array - contiguous memory, fixed size',
      'Linked list - scattered memory, dynamic size',
      'Array has O(1) random access',
      'Linked list has O(1) insertion/deletion at ends',
      'Different memory and performance characteristics'
    ],
    sampleAnswer: 'Arrays store elements in contiguous memory with fixed size and O(1) random access but O(n) insertion/deletion. Linked lists use scattered memory with dynamic size, O(1) insertion/deletion at known positions, but O(n) random access. Choice depends on access patterns and memory constraints.',
    tags: ['arrays', 'linked-lists', 'data-structures-basics']
  },
  
  // Data Structures - Medium
  {
    category: 'Data Structures',
    difficulty: 'Medium',
    topic: 'Hash Tables',
    question: 'How do hash tables work and handle collisions?',
    expectedKeyPoints: [
      'Hash function maps keys to array indices',
      'Average O(1) lookup, insert, delete',
      'Collisions handled by chaining or open addressing',
      'Chaining uses linked lists',
      'Open addressing probes for next empty slot'
    ],
    sampleAnswer: 'Hash tables use a hash function to map keys to array indices for O(1) average-case operations. Collisions occur when multiple keys hash to same index. Chaining handles this by storing multiple values in linked lists. Open addressing finds alternative slots through probing. Load factor affects performance.',
    tags: ['hash-tables', 'hashing', 'data-structures']
  },
  
  // Data Structures - Hard
  {
    category: 'Data Structures',
    difficulty: 'Hard',
    topic: 'Tree Balancing',
    question: 'Explain self-balancing trees and their importance.',
    expectedKeyPoints: [
      'Maintain balanced height for O(log n) operations',
      'AVL trees use rotations',
      'Red-Black trees use color properties',
      'Prevent worst-case O(n) degradation',
      'Trade-off between balancing cost and query performance'
    ],
    sampleAnswer: 'Self-balancing trees like AVL and Red-Black trees maintain balanced height to guarantee O(log n) operations. AVL trees strictly balance using rotations after modifications. Red-Black trees use color properties with relaxed balancing, fewer rotations but slightly taller trees. They prevent binary search tree degradation to O(n) in worst case.',
    tags: ['trees', 'balancing', 'advanced-data-structures']
  },
  
  // Algorithms - Medium
  {
    category: 'Algorithms',
    difficulty: 'Medium',
    topic: 'Time Complexity',
    question: 'Explain Big O notation and common time complexities.',
    expectedKeyPoints: [
      'Describes algorithm growth rate',
      'O(1) constant, O(log n) logarithmic',
      'O(n) linear, O(n log n) linearithmic',
      'O(n²) quadratic, O(2^n) exponential',
      'Worst-case, average-case, best-case scenarios'
    ],
    sampleAnswer: 'Big O notation describes how algorithm runtime grows with input size. Common complexities from fastest to slowest: O(1) constant, O(log n) logarithmic, O(n) linear, O(n log n) linearithmic, O(n²) quadratic, O(2^n) exponential. We typically analyze worst-case to guarantee performance bounds.',
    tags: ['time-complexity', 'big-o', 'algorithm-analysis']
  },
  
  // OOP - Easy
  {
    category: 'OOP',
    difficulty: 'Easy',
    topic: 'OOP Principles',
    question: 'Explain the four pillars of Object-Oriented Programming.',
    expectedKeyPoints: [
      'Encapsulation - bundling data and methods',
      'Abstraction - hiding complexity',
      'Inheritance - code reuse through parent-child',
      'Polymorphism - same interface, different implementations',
      'Fundamental concepts for OOP design'
    ],
    sampleAnswer: 'The four OOP pillars are: Encapsulation (bundling data and methods, hiding internal details), Abstraction (hiding complexity, showing only necessary features), Inheritance (creating new classes from existing ones for code reuse), and Polymorphism (same interface with different implementations, enabling flexibility).',
    tags: ['oop', 'principles', 'fundamentals']
  },
  
  // General CS - Medium
  {
    category: 'General CS',
    difficulty: 'Medium',
    topic: 'REST API',
    question: 'What makes an API RESTful?',
    expectedKeyPoints: [
      'Stateless communication',
      'Client-server architecture',
      'Uniform interface (HTTP methods)',
      'Resource-based (URLs identify resources)',
      'Cacheable responses'
    ],
    sampleAnswer: 'RESTful APIs follow constraints: stateless communication (no session data stored), client-server separation, uniform interface using HTTP methods (GET, POST, PUT, DELETE), resource-based URLs, and cacheable responses. These principles enable scalability, simplicity, and independence between client and server.',
    tags: ['rest', 'api', 'web-development']
  }
];

async function seedConceptualQuestions() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URL);
    console.log('Connected to MongoDB');

    // Clear existing questions
    console.log('Clearing existing conceptual questions...');
    await ConceptualQuestion.deleteMany({});
    console.log('Cleared existing questions');

    // Insert new questions
    console.log('Inserting conceptual questions...');
    const result = await ConceptualQuestion.insertMany(conceptualQuestions);
    console.log(`✅ Successfully inserted ${result.length} conceptual questions`);

    // Show summary
    const categories = await ConceptualQuestion.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n📊 Summary by Category:');
    categories.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count} questions`);
    });

    const difficulties = await ConceptualQuestion.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n📊 Summary by Difficulty:');
    difficulties.forEach(diff => {
      console.log(`  ${diff._id}: ${diff.count} questions`);
    });

    console.log('\n✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding questions:', error);
    process.exit(1);
  }
}

// Run the seed function
seedConceptualQuestions();
