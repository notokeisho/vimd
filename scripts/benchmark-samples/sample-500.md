# Sample Document (500 lines)

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

This document contains approximately 500 lines of markdown content with various elements:

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

End of document.
