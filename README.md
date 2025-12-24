# Velvetta Backend API

Production-ready Node.js backend API for the Velvetta talent platform.

## Features

- **Express.js** RESTful API
- **MySQL** database with connection pooling
- **JWT** authentication
- **Bcrypt** password hashing
- **Role-based access control** (user/admin)
- **File upload** with Multer
- **Image processing** with Sharp
- **Security middleware**: Helmet, CORS, rate limiting
- **Input validation** with Joi
- **HTML sanitization** to prevent XSS
- **MVC architecture**

## Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

## Installation

1. **Clone and navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your database credentials and JWT secret.

4. **Set up MySQL database:**
```bash
# Create database (or let migration create it)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS velvetta_db;"
```

5. **Run migrations:**
```bash
npm run migrate
```

This will create all necessary tables and insert a default admin user:
- Email: `admin@velvetta.com`
- Password: `admin123`

**⚠️ IMPORTANT:** Change the admin password immediately after first login!

## Running the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on `http://localhost:3000` (or PORT from .env)

## API Endpoints

### Authentication

- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get current user profile (auth required)
- `PATCH /api/users/password` - Update password (auth required)
- `PATCH /api/users/:userId/vvip` - Update user VVIP status (admin only)

### Products (Public Read, Admin CRUD)

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin only)
- `PATCH /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Talents (Public Read, Admin CRUD)

- `GET /api/talents` - Get all talents
- `GET /api/talents/:id` - Get talent by ID
- `POST /api/talents` - Create talent (admin only)
- `PATCH /api/talents/:id` - Update talent (admin only)
- `DELETE /api/talents/:id` - Delete talent (admin only)
- `DELETE /api/talents/:talentId/images/:imageId` - Delete talent image (admin only)

### Blogs (Public Read, Admin CRUD)

- `GET /api/blogs` - Get all blogs (optional `?limit=N` query param)
- `GET /api/blogs/:id` - Get blog by ID
- `POST /api/blogs` - Create blog (admin only)
- `PATCH /api/blogs/:id` - Update blog (admin only)
- `DELETE /api/blogs/:id` - Delete blog (admin only)

### Home Configuration (Public Read, Admin Update)

- `GET /api/home-config` - Get home page configuration
- `PATCH /api/home-config` - Update home configuration (admin only)

## Authentication

Include JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## File Uploads

### Product Image
- Field name: `image`
- Max size: 5MB
- Allowed types: JPEG, JPG, PNG, WebP
- Processed to: 800x800px, WebP format

### Talent Images
- Field name: `images` (array)
- Max files: 10
- Max size per file: 5MB
- Allowed types: JPEG, JPG, PNG, WebP
- Processed to: 1920x1920px, WebP format

### Blog Thumbnail
- Field name: `thumbnail`
- Max size: 5MB
- Allowed types: JPEG, JPG, PNG, WebP
- Processed to: 1200x630px, WebP format

### Carousel Images
- Field names: `desktopImages`, `mobileImages` (arrays)
- Max files per field: 10
- Desktop: 1920x1080px
- Mobile: 768x1024px

## Response Format

All API responses follow this structure:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ] // Optional validation errors
}
```

## Security Features

1. **Password Hashing**: Bcrypt with 10 rounds
2. **JWT Tokens**: Secure token-based authentication
3. **Rate Limiting**: 
   - General API: 100 requests per 15 minutes
   - Auth endpoints: 5 requests per 15 minutes
   - File uploads: 20 uploads per hour
4. **Input Validation**: Joi schema validation
5. **HTML Sanitization**: DOMPurify for WYSIWYG content
6. **SQL Injection Prevention**: Prepared statements only
7. **File Upload Security**: 
   - MIME type validation
   - File size limits
   - Safe filename generation
8. **CORS**: Configurable origin restrictions
9. **Helmet**: Security headers

## Database Schema

See `migrations/001_create_tables.sql` for complete schema.

### Key Tables:
- `users` - User accounts with role-based access
- `products` - Product catalog
- `talents` - Talent profiles
- `talent_images` - Talent image gallery
- `blogs` - Blog/news posts
- `home_config` - Home page configuration

## Environment Variables

See `.env.example` for all available configuration options.

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/     # Express middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── app.js           # Express app setup
│   └── server.js         # Server entry point
├── migrations/          # SQL migration files
├── uploads/            # Uploaded files
└── package.json
```

## Development

### Adding New Endpoints

1. Create model in `src/models/`
2. Create service in `src/services/`
3. Create controller in `src/controllers/`
4. Create routes in `src/routes/`
5. Add route to `src/app.js`

### Testing

Use tools like Postman, Insomnia, or curl to test endpoints.

Example login:
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@velvetta.com","password":"admin123"}'
```

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use strong `JWT_SECRET`
3. Configure proper `CORS_ORIGIN`
4. Set up reverse proxy (nginx)
5. Use process manager (PM2)
6. Enable SSL/TLS
7. Set up database backups
8. Configure file storage (consider cloud storage for uploads)

## License

ISC

