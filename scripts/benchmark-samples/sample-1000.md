# Sample Document (1000 lines)

This is a benchmark sample file for vimd v0.2.0 performance testing.

## Introduction

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

### Project Overview

This document serves as a comprehensive test case for markdown parsing performance. It includes various markdown elements to simulate real-world documentation scenarios.

## Chapter 1: Getting Started

### 1.1 Installation

To install the package, run the following command:

```bash
npm install -g vimd
```

After installation, verify it works:

```bash
vimd --version
```

### 1.2 Basic Usage

Start the development server:

```bash
vimd dev README.md
```

Build static HTML:

```bash
vimd build README.md -o output.html
```

### 1.3 Configuration

Create a configuration file at `~/.vimd/config.js`:

```javascript
export default {
  theme: 'github',
  port: 8080,
  open: true,
};
```

## Chapter 2: Code Examples

### 2.1 JavaScript Examples

```javascript
// Function declaration
function calculateTotal(items) {
  return items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
}

// Arrow function
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Class definition
class ShoppingCart {
  constructor() {
    this.items = [];
  }

  addItem(item) {
    this.items.push(item);
  }

  getTotal() {
    return calculateTotal(this.items);
  }
}

// Usage
const cart = new ShoppingCart();
cart.addItem({ name: 'Widget', price: 9.99, quantity: 2 });
console.log(formatCurrency(cart.getTotal()));
```

### 2.2 TypeScript Examples

```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  category: Category;
}

enum Category {
  Electronics = 'ELECTRONICS',
  Clothing = 'CLOTHING',
  Books = 'BOOKS',
}

type ProductList = Product[];

class ProductService {
  private products: ProductList = [];

  async fetchProducts(): Promise<ProductList> {
    const response = await fetch('/api/products');
    this.products = await response.json();
    return this.products;
  }

  filterByCategory(category: Category): ProductList {
    return this.products.filter(p => p.category === category);
  }
}

const service = new ProductService();
service.fetchProducts().then(products => {
  console.log(`Loaded ${products.length} products`);
});
```

### 2.3 Python Examples

```python
from dataclasses import dataclass
from typing import List, Optional
from datetime import datetime

@dataclass
class User:
    id: int
    name: str
    email: str
    created_at: datetime

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }

class UserRepository:
    def __init__(self):
        self._users: List[User] = []

    def add(self, user: User) -> None:
        self._users.append(user)

    def find_by_id(self, user_id: int) -> Optional[User]:
        for user in self._users:
            if user.id == user_id:
                return user
        return None

    def find_all(self) -> List[User]:
        return self._users.copy()

# Usage example
repo = UserRepository()
repo.add(User(1, 'Alice', 'alice@example.com', datetime.now()))
repo.add(User(2, 'Bob', 'bob@example.com', datetime.now()))

user = repo.find_by_id(1)
if user:
    print(user.to_dict())
```

### 2.4 Go Examples

```go
package main

import (
    "encoding/json"
    "fmt"
    "net/http"
)

type Response struct {
    Status  string `json:"status"`
    Message string `json:"message"`
}

func handleRequest(w http.ResponseWriter, r *http.Request) {
    response := Response{
        Status:  "success",
        Message: "Request processed successfully",
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

func main() {
    http.HandleFunc("/api", handleRequest)
    fmt.Println("Server starting on :8080")
    http.ListenAndServe(":8080", nil)
}
```

### 2.5 Rust Examples

```rust
use std::collections::HashMap;

struct Cache<T> {
    data: HashMap<String, T>,
}

impl<T: Clone> Cache<T> {
    fn new() -> Self {
        Cache {
            data: HashMap::new(),
        }
    }

    fn get(&self, key: &str) -> Option<T> {
        self.data.get(key).cloned()
    }

    fn set(&mut self, key: String, value: T) {
        self.data.insert(key, value);
    }
}

fn main() {
    let mut cache: Cache<String> = Cache::new();
    cache.set("greeting".to_string(), "Hello, World!".to_string());

    if let Some(value) = cache.get("greeting") {
        println!("{}", value);
    }
}
```

## Chapter 3: Data Tables

### 3.1 Simple Table

| ID | Name | Status |
|----|------|--------|
| 1 | Item A | Active |
| 2 | Item B | Pending |
| 3 | Item C | Active |
| 4 | Item D | Inactive |
| 5 | Item E | Active |

### 3.2 Detailed Comparison Table

| Feature | Free Plan | Pro Plan | Enterprise |
|---------|-----------|----------|------------|
| Users | 5 | 50 | Unlimited |
| Storage | 1 GB | 100 GB | 1 TB |
| API Calls | 1,000/day | 50,000/day | Unlimited |
| Support | Community | Email | 24/7 Phone |
| Custom Domain | No | Yes | Yes |
| SSO | No | No | Yes |
| Price | $0 | $29/mo | Contact Us |

### 3.3 Technical Specifications

| Component | Specification | Notes |
|-----------|--------------|-------|
| CPU | Intel i7-12700K | 12 cores, 20 threads |
| RAM | 32 GB DDR5 | 4800 MHz |
| Storage | 1 TB NVMe SSD | PCIe 4.0 |
| GPU | RTX 3080 | 10 GB VRAM |
| PSU | 850W Gold | Fully modular |
| Cooling | 360mm AIO | Custom loop optional |

## Chapter 4: Lists and Tasks

### 4.1 Unordered Lists

- First level item
  - Second level item
    - Third level item
    - Another third level
  - Back to second level
- Another first level
- Final first level item

### 4.2 Ordered Lists

1. First step
   1. Sub-step A
   2. Sub-step B
2. Second step
3. Third step
   1. Sub-step A
   2. Sub-step B
   3. Sub-step C
4. Fourth step

### 4.3 Task Lists

- [x] Project initialization
- [x] Setup development environment
- [x] Configure build tools
- [ ] Implement core features
  - [x] Feature A
  - [ ] Feature B
  - [ ] Feature C
- [ ] Write documentation
- [ ] Deploy to production

### 4.4 Definition Lists

Term 1
: Definition of term 1

Term 2
: Definition of term 2
: Another definition for term 2

## Chapter 5: Formatting

### 5.1 Text Styles

This is **bold text** and this is *italic text*.

This is ***bold and italic*** text.

This is ~~strikethrough~~ text.

This is `inline code` within text.

### 5.2 Blockquotes

> This is a simple blockquote.

> This is a multi-paragraph blockquote.
>
> It continues here with more content.
>
> And even more here.

> Nested blockquotes work too.
>
> > This is nested.
> >
> > > And this is double nested.

### 5.3 Horizontal Rules

---

***

___

## Chapter 6: Links and Media

### 6.1 Links

- [External Link](https://github.com)
- [Link with Title](https://github.com "GitHub Homepage")
- [Reference Link][ref1]
- <https://automatic-link.com>

[ref1]: https://example.com "Reference Link Example"

### 6.2 Images

![Alt Text](https://via.placeholder.com/300x200 "Image Title")

![Small Image](https://via.placeholder.com/100)

### 6.3 Image Links

[![Linked Image](https://via.placeholder.com/150)](https://example.com)

## Chapter 7: Advanced Features

### 7.1 Footnotes

Here is a sentence with a footnote[^1].

Another sentence with a different footnote[^2].

[^1]: This is the first footnote content.
[^2]: This is the second footnote content.

### 7.2 Abbreviations

The HTML specification is maintained by the W3C.

*[HTML]: Hyper Text Markup Language
*[W3C]: World Wide Web Consortium

### 7.3 Math Equations (for pandoc mode)

Inline math: $E = mc^2$

Block math:

$$
\frac{n!}{k!(n-k)!} = \binom{n}{k}
$$

## Chapter 8: Additional Content

### 8.1 More Code Examples

```sql
-- SQL Example
SELECT
    u.id,
    u.name,
    u.email,
    COUNT(o.id) as order_count,
    SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC
LIMIT 10;
```

```yaml
# YAML Configuration
server:
  host: localhost
  port: 8080
  timeout: 30s

database:
  driver: postgres
  host: localhost
  port: 5432
  name: myapp
  pool:
    max_connections: 20
    min_connections: 5

logging:
  level: info
  format: json
  output: stdout
```

```json
{
  "name": "sample-project",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.0",
    "typescript": "^5.0.0"
  },
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc",
    "test": "jest"
  }
}
```

### 8.2 Extended Table

| Month | Revenue | Expenses | Profit | Growth |
|-------|---------|----------|--------|--------|
| Jan | $10,000 | $7,000 | $3,000 | - |
| Feb | $12,000 | $7,500 | $4,500 | 50% |
| Mar | $15,000 | $8,000 | $7,000 | 56% |
| Apr | $14,000 | $8,500 | $5,500 | -21% |
| May | $18,000 | $9,000 | $9,000 | 64% |
| Jun | $22,000 | $10,000 | $12,000 | 33% |

### 8.3 Additional Paragraphs

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisi vel consectetur interdum, nisl nunc egestas nunc, vitae tincidunt nisl nunc euismod nunc.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

## Conclusion

This document contains approximately 1000 lines of markdown content with various elements:

- Multiple heading levels (h1 to h3)
- Paragraphs with lorem ipsum and technical content
- Code blocks in multiple languages (JS, TS, Python, Go, Rust, Bash)
- Various table formats
- Lists (unordered, ordered, task lists)
- Text formatting (bold, italic, strikethrough)
- Blockquotes (simple and nested)
- Links and images
- Footnotes and abbreviations

This provides a realistic test case for markdown parsing performance.

---

## Appendix A: Extended Code Samples

### A.1 React Component

```tsx
import React, { useState, useEffect, useCallback } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

interface UserCardProps {
  user: User;
  onSelect: (user: User) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(() => {
    onSelect(user);
  }, [user, onSelect]);

  return (
    <div
      className={`user-card ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <img src={user.avatar} alt={user.name} />
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
};

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="user-list">
      {users.map(user => (
        <UserCard
          key={user.id}
          user={user}
          onSelect={u => console.log('Selected:', u)}
        />
      ))}
    </div>
  );
};

export default UserList;
```

### A.2 Vue Component

```vue
<template>
  <div class="todo-app">
    <h1>{{ title }}</h1>
    <input
      v-model="newTodo"
      @keyup.enter="addTodo"
      placeholder="Add a new todo"
    />
    <ul>
      <li
        v-for="todo in filteredTodos"
        :key="todo.id"
        :class="{ completed: todo.completed }"
      >
        <input
          type="checkbox"
          v-model="todo.completed"
        />
        <span>{{ todo.text }}</span>
        <button @click="removeTodo(todo.id)">Delete</button>
      </li>
    </ul>
    <div class="filters">
      <button
        v-for="filter in filters"
        :key="filter"
        :class="{ active: currentFilter === filter }"
        @click="currentFilter = filter"
      >
        {{ filter }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export default defineComponent({
  name: 'TodoApp',
  setup() {
    const title = ref('My Todo List');
    const newTodo = ref('');
    const todos = ref<Todo[]>([]);
    const currentFilter = ref('all');
    const filters = ['all', 'active', 'completed'];

    const filteredTodos = computed(() => {
      switch (currentFilter.value) {
        case 'active':
          return todos.value.filter(t => !t.completed);
        case 'completed':
          return todos.value.filter(t => t.completed);
        default:
          return todos.value;
      }
    });

    const addTodo = () => {
      if (newTodo.value.trim()) {
        todos.value.push({
          id: Date.now(),
          text: newTodo.value,
          completed: false
        });
        newTodo.value = '';
      }
    };

    const removeTodo = (id: number) => {
      todos.value = todos.value.filter(t => t.id !== id);
    };

    return {
      title,
      newTodo,
      todos,
      currentFilter,
      filters,
      filteredTodos,
      addTodo,
      removeTodo
    };
  }
});
</script>
```

### A.3 Docker Configuration

```dockerfile
# Multi-stage build for Node.js application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

# Copy built files
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "dist/index.js"]
```

### A.4 Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  labels:
    app: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: web-app
        image: myregistry/web-app:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
---
apiVersion: v1
kind: Service
metadata:
  name: web-app-service
spec:
  selector:
    app: web-app
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

## Appendix B: Additional Tables

### B.1 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /api/users | List all users | Yes |
| GET | /api/users/:id | Get user by ID | Yes |
| POST | /api/users | Create new user | Yes |
| PUT | /api/users/:id | Update user | Yes |
| DELETE | /api/users/:id | Delete user | Yes |
| GET | /api/products | List products | No |
| GET | /api/products/:id | Get product | No |
| POST | /api/cart | Add to cart | Yes |
| GET | /api/cart | View cart | Yes |
| POST | /api/orders | Create order | Yes |
| GET | /api/orders | List orders | Yes |
| GET | /api/orders/:id | Get order | Yes |

### B.2 Error Codes

| Code | Name | Description |
|------|------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 502 | Bad Gateway | Upstream error |
| 503 | Service Unavailable | Service temporarily down |

### B.3 Performance Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Response Time (p50) | < 100ms | 85ms | Pass |
| Response Time (p95) | < 500ms | 420ms | Pass |
| Response Time (p99) | < 1000ms | 890ms | Pass |
| Error Rate | < 0.1% | 0.05% | Pass |
| Availability | 99.9% | 99.95% | Pass |
| Throughput | > 1000 RPS | 1250 RPS | Pass |
| CPU Usage | < 70% | 55% | Pass |
| Memory Usage | < 80% | 62% | Pass |

## Appendix C: Additional Text Content

### C.1 Technical Documentation

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras porttitor metus justo, ut fringilla velit fermentum a. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.

Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Nulla porttitor accumsan tincidunt. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula.

Curabitur aliquet quam id dui posuere blandit. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui. Donec rutrum congue leo eget malesuada.

### C.2 System Architecture

The system follows a microservices architecture with the following components:

1. **API Gateway**: Handles routing, authentication, and rate limiting
2. **User Service**: Manages user accounts and authentication
3. **Product Service**: Handles product catalog and inventory
4. **Order Service**: Processes orders and payments
5. **Notification Service**: Sends emails and push notifications
6. **Analytics Service**: Collects and processes metrics

Each service communicates via message queues for async operations and REST APIs for sync operations.

### C.3 Security Considerations

Security is implemented at multiple layers:

- **Transport**: All traffic encrypted via TLS 1.3
- **Authentication**: JWT tokens with short expiry
- **Authorization**: Role-based access control (RBAC)
- **Data**: Encryption at rest using AES-256
- **Audit**: Comprehensive logging of all operations
- **Monitoring**: Real-time alerting for anomalies

### C.4 Deployment Strategy

The deployment follows a blue-green strategy:

1. Deploy new version to inactive environment
2. Run smoke tests and health checks
3. Gradually shift traffic using weighted routing
4. Monitor metrics for anomalies
5. Complete cutover or rollback as needed

This ensures zero-downtime deployments and quick rollback capability.

---

## Appendix D: Final Notes

### D.1 Glossary

**API**: Application Programming Interface
**CLI**: Command Line Interface
**CSS**: Cascading Style Sheets
**DOM**: Document Object Model
**HTML**: HyperText Markup Language
**HTTP**: HyperText Transfer Protocol
**JSON**: JavaScript Object Notation
**JWT**: JSON Web Token
**REST**: Representational State Transfer
**SQL**: Structured Query Language
**TLS**: Transport Layer Security
**URL**: Uniform Resource Locator
**YAML**: YAML Ain't Markup Language

### D.2 References

1. Node.js Documentation: https://nodejs.org/docs
2. TypeScript Handbook: https://www.typescriptlang.org/docs
3. MDN Web Docs: https://developer.mozilla.org
4. GitHub Guides: https://guides.github.com

### D.3 Changelog

- v1.0.0 - Initial release
- v1.1.0 - Added new features
- v1.2.0 - Performance improvements
- v1.3.0 - Bug fixes and stability
- v2.0.0 - Major redesign

### D.4 License

This document is provided under the MIT License.

### D.5 Contact

For questions or feedback, please contact:
- Email: support@example.com
- GitHub: https://github.com/example
- Twitter: @example

### D.6 Acknowledgments

Special thanks to all contributors who helped make this project possible.

Thank you for reading this document.

---

End of document.
