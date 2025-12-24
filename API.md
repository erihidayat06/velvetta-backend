# Velvetta Backend API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## User Endpoints

### Register
**POST** `/users/register`

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "user",
      "vvip": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
**POST** `/users/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** Same as register

### Get Profile
**GET** `/users/profile` (Auth required)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "user",
    "vvip": false
  }
}
```

### Update Password
**PATCH** `/users/password` (Auth required)

**Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### Update User VVIP Status
**PATCH** `/users/:userId/vvip` (Admin only)

**Body:**
```json
{
  "vvip": true
}
```

---

## Product Endpoints

### Get All Products
**GET** `/products` (Public)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Premium Toy 1",
      "price": "99.99",
      "description": "High-quality premium toy",
      "image": "/uploads/products/image_1234567890_abc123.webp"
    }
  ]
}
```

### Get Product by ID
**GET** `/products/:id` (Public)

### Create Product
**POST** `/products` (Admin only)

**Content-Type:** `multipart/form-data`

**Body:**
- `name` (string, required)
- `price` (number, required)
- `description` (string, optional)
- `image` (file, optional) - Max 5MB, JPEG/PNG/WebP

### Update Product
**PATCH** `/products/:id` (Admin only)

**Content-Type:** `multipart/form-data`

**Body:** Same as create (all fields optional)

### Delete Product
**DELETE** `/products/:id` (Admin only)

---

## Talent Endpoints

### Get All Talents
**GET** `/talents` (Public)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Talent One",
      "level": "Premium",
      "category": "Premium",
      "image": "/uploads/talents/image_1234567890_abc123.webp",
      "description": "...",
      "age": "25",
      "location": "Available Worldwide",
      "languages": ["English", "Spanish"],
      "specialties": ["Professional Service", "Discrete"]
    }
  ]
}
```

### Get Talent by ID
**GET** `/talents/:id` (Public)

**Response:** Includes `images` array with all talent images

### Create Talent
**POST** `/talents` (Admin only)

**Content-Type:** `multipart/form-data`

**Body:**
- `name` (string, required)
- `level` (enum: "Premium", "Elite", "VIP", required)
- `description` (HTML string, required) - Will be sanitized
- `age` (string, optional)
- `location` (string, optional)
- `languages` (JSON array, optional)
- `specialties` (JSON array, optional)
- `images` (files array, optional) - Max 30 files, 5MB each

### Update Talent
**PATCH** `/talents/:id` (Admin only)

**Content-Type:** `multipart/form-data`

**Body:** Same as create (all fields optional)

### Delete Talent
**DELETE** `/talents/:id` (Admin only)

### Delete Talent Image
**DELETE** `/talents/:talentId/images/:imageId` (Admin only)

---

## Blog Endpoints

### Get All Blogs
**GET** `/blogs` (Public)

**Query Params:**
- `limit` (number, optional) - Limit number of results

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Latest Updates",
      "description": "Stay updated...",
      "content": "<p>HTML content...</p>",
      "thumbnail": "/uploads/blogs/thumb_1234567890_abc123.webp",
      "date": "2024-01-15"
    }
  ]
}
```

### Get Blog by ID
**GET** `/blogs/:id` (Public)

### Create Blog
**POST** `/blogs` (Admin only)

**Content-Type:** `multipart/form-data`

**Body:**
- `title` (string, required)
- `description` (string, required, max 500 chars)
- `content` (HTML string, required) - Will be sanitized
- `thumbnail` (file, optional) - Max 5MB

### Update Blog
**PATCH** `/blogs/:id` (Admin only)

**Content-Type:** `multipart/form-data`

**Body:** Same as create (all fields optional)

### Delete Blog
**DELETE** `/blogs/:id` (Admin only)

---

## Home Config Endpoints

### Get Home Configuration
**GET** `/home-config` (Public)

**Response:**
```json
{
  "success": true,
  "data": {
    "featuredTalents": [
      {
        "id": 1,
        "name": "Talent One",
        "category": "Premium",
        "image": "/uploads/talents/..."
      }
    ],
    "carouselSlides": [
      {
        "src": "/uploads/carousel/desktop_image.webp",
        "mobileSrc": "/uploads/carousel/mobile_image.webp",
        "title": "",
        "subtitle": ""
      }
    ]
  }
}
```

### Update Home Configuration
**PATCH** `/home-config` (Admin only)

**Content-Type:** `multipart/form-data`

**Body:**
- `featuredTalentIds` (JSON array, required) - Exactly 4 talent IDs
- `desktopImages` (files array, optional) - Max 10 files
- `mobileImages` (files array, optional) - Max 10 files

**Example:**
```javascript
const formData = new FormData();
formData.append('featuredTalentIds', JSON.stringify([1, 2, 3, 4]));
formData.append('desktopImages', file1);
formData.append('desktopImages', file2);
formData.append('mobileImages', mobileFile1);
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limits

- **General API:** 100 requests per 15 minutes
- **Auth endpoints:** 5 requests per 15 minutes
- **File uploads:** 20 uploads per hour

---

## File Upload Specifications

### Product Images
- **Format:** JPEG, PNG, WebP
- **Max Size:** 5MB
- **Processing:** Resized to 800x800px, converted to WebP

### Talent Images
- **Format:** JPEG, PNG, WebP
- **Max Size:** 5MB per file
- **Max Files:** 30 per talent
- **Processing:** Resized to 1920x1920px, converted to WebP

### Blog Thumbnails
- **Format:** JPEG, PNG, WebP
- **Max Size:** 5MB
- **Processing:** Resized to 1200x630px, converted to WebP

### Carousel Images
- **Desktop:** 1920x1080px, WebP
- **Mobile:** 768x1024px, WebP
- **Max Size:** 5MB per file
- **Max Files:** 10 per type

---

## Notes

1. All HTML content (blog content, talent descriptions) is sanitized to prevent XSS attacks
2. All file uploads are validated for MIME type and size
3. File names are sanitized and made unique
4. Images are automatically compressed and optimized
5. Only admins can create, update, or delete content
6. Public users can only read (GET) content

