# CRUD Patterns Reference Guide

## Universal Patterns for HTTP Methods

This guide provides standard patterns for CRUD operations that work regardless of the database you're using.

---

## **GET (Read) - Retrieve Data**

### Pattern:
1. Extract query params/route params
2. Validate required fields
3. Query database
4. Return data

### Example - Get Single Item:
```javascript
export async function getItemById(req, res) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: "Item ID is required" });
    }
    
    const item = await db.findById(id); // Generic DB call
    
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    
    res.status(200).json(item);
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
```

### Example - Get Multiple Items:
```javascript
export async function getItemsByUserId(req, res) {
  try {
    const { userId } = req.params;
    const { limit, offset } = req.query; // Optional pagination
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    const items = await db.findByUserId(userId, { limit, offset });
    
    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
```

---

## **POST (Create) - Create New Data**

### Pattern:
1. Extract data from `req.body`
2. Validate required fields
3. Insert into database
4. Return created item

### Example:
```javascript
export async function createItem(req, res) {
  try {
    const { userId, title, amount, category } = req.body;
    
    // Validate required fields
    if (!userId || !title || amount === undefined || !category) {
      return res.status(400).json({ 
        message: "All fields are required: userId, title, amount, category" 
      });
    }
    
    // Additional validation
    if (typeof amount !== 'number') {
      return res.status(400).json({ message: "Amount must be a number" });
    }
    
    const newItem = await db.create({
      userId,
      title,
      amount,
      category
    });
    
    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
```

---

## **PUT/PATCH (Update) - Modify Existing Data**

### Pattern:
1. Extract `id` from `req.params`
2. Extract update data from `req.body`
3. Validate both
4. Update in database
5. Return updated item

### Example - PUT (Full Update):
```javascript
export async function updateItem(req, res) {
  try {
    const { id } = req.params;
    const { title, amount, category } = req.body;
    
    if (!id) {
      return res.status(400).json({ message: "Item ID is required" });
    }
    
    if (!title || amount === undefined || !category) {
      return res.status(400).json({ 
        message: "All fields are required: title, amount, category" 
      });
    }
    
    const updatedItem = await db.updateById(id, {
      title,
      amount,
      category
    });
    
    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    
    res.status(200).json(updatedItem);
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
```

### Example - PATCH (Partial Update):
```javascript
export async function patchItem(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!id) {
      return res.status(400).json({ message: "Item ID is required" });
    }
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "At least one field is required for update" });
    }
    
    const updatedItem = await db.updateById(id, updateData);
    
    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    
    res.status(200).json(updatedItem);
  } catch (error) {
    console.error("Error patching item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
```

---

## **DELETE - Remove Data**

### Pattern:
1. Extract `id` from `req.params`
2. Validate id exists
3. Delete from database
4. Return success message

### Example:
```javascript
export async function deleteItem(req, res) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: "Item ID is required" });
    }
    
    // Optional: Validate ID format
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid item ID format" });
    }
    
    const deletedItem = await db.deleteById(id);
    
    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    
    res.status(200).json({ 
      message: "Item deleted successfully",
      deletedItem // Optional: return deleted item
    });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
```

---

## **Common Status Codes**

- **200**: OK (successful GET, PUT, DELETE)
- **201**: Created (successful POST)
- **400**: Bad Request (validation errors, missing data)
- **404**: Not Found (item doesn't exist)
- **500**: Internal Server Error (database/server issues)

---

## **Database Abstraction Examples**

The `db` object in the examples above represents your database layer. Here's how it might look with different databases:

### SQL (with your current setup):
```javascript
const db = {
  findById: (id) => sql`SELECT * FROM items WHERE id = ${id}`,
  findByUserId: (userId) => sql`SELECT * FROM items WHERE user_id = ${userId}`,
  create: (data) => sql`INSERT INTO items (user_id, title, amount, category) 
                        VALUES (${data.userId}, ${data.title}, ${data.amount}, ${data.category}) 
                        RETURNING *`,
  updateById: (id, data) => sql`UPDATE items SET title = ${data.title}, amount = ${data.amount} 
                                WHERE id = ${id} RETURNING *`,
  deleteById: (id) => sql`DELETE FROM items WHERE id = ${id} RETURNING *`
};
```

### MongoDB (with Mongoose):
```javascript
const db = {
  findById: (id) => Item.findById(id),
  findByUserId: (userId) => Item.find({ userId }),
  create: (data) => Item.create(data),
  updateById: (id, data) => Item.findByIdAndUpdate(id, data, { new: true }),
  deleteById: (id) => Item.findByIdAndDelete(id)
};
```

### Prisma ORM:
```javascript
const db = {
  findById: (id) => prisma.item.findUnique({ where: { id } }),
  findByUserId: (userId) => prisma.item.findMany({ where: { userId } }),
  create: (data) => prisma.item.create({ data }),
  updateById: (id, data) => prisma.item.update({ where: { id }, data }),
  deleteById: (id) => prisma.item.delete({ where: { id } })
};
```

---

## **Key Takeaways**

1. **Always use try/catch blocks** for error handling
2. **Validate inputs** before database operations
3. **Use appropriate HTTP status codes**
4. **Return meaningful error messages**
5. **Log errors** for debugging
6. **Abstract database operations** for cleaner code
7. **Check if items exist** before update/delete operations

This pattern works universally across all databases and frameworks!