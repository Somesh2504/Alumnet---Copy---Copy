# Alumnet Backend API

A comprehensive MERN stack backend for managing alumni networks with role-based access control.

## System Flow

### 1. Super Admin Management
- **Super Admin** registers and approves colleges
- Only approved colleges can access their dashboard
- Super admin can manage all colleges

### 2. College Dashboard
- **Colleges** login with approved credentials
- Upload student/alumni records to the system
- Manage their student and alumni data

### 3. Student/Alumni Registration
- **Students/Alumni** can only register if their email exists in college records
- Email verification via OTP
- Role-based access after verification

## Models

### Admin Model
```javascript
{
  email: String (required, unique),
  passwordHash: String (required),
  role: String (default: 'superadmin')
}
```

### College Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  passwordHash: String (required),
  approved: Boolean (default: false),
  addedBy: ObjectId (ref: Admin),
  students: [ObjectId] (ref: Student),
  alumni: [ObjectId] (ref: Alumni)
}
```

### StudentRecord Model
```javascript
{
  collegeId: ObjectId (ref: College),
  name: String (required),
  email: String (required, unique),
  branch: String (required),
  year: Number (required),
  role: String (enum: ['student', 'alumni'])
}
```

### AlumniRecord Model
```javascript
{
  collegeId: ObjectId (ref: College),
  name: String (required),
  email: String (required, unique),
  branch: String (required),
  year: Number (required),
  role: String (enum: ['student', 'alumni'])
}
```

## API Endpoints

### Super Admin Routes (`/api/admin`)

#### Authentication
- `POST /login` - Super admin login

#### College Management
- `POST /register-college` - Register new college (requires admin auth)
- `PUT /approve-college/:collegeId` - Approve college (requires admin auth)
- `GET /colleges` - Get all colleges (requires admin auth)
- `GET /pending-colleges` - Get pending colleges (requires admin auth)
- `DELETE /college/:collegeId` - Delete college (requires admin auth)

### College Routes (`/api/college`)

#### Authentication
- `POST /login` - College login

#### Dashboard
- `GET /dashboard` - Get college dashboard data (requires college auth)

#### Student Records Management
- `POST /student-record` - Add single student record (requires college auth)
- `POST /bulk-upload-students` - Bulk upload student records (requires college auth)
- `GET /student-records` - Get all student records (requires college auth)
- `DELETE /student-record/:recordId` - Delete student record (requires college auth)

#### Alumni Records Management
- `POST /alumni-record` - Add single alumni record (requires college auth)
- `GET /alumni-records` - Get all alumni records (requires college auth)
- `DELETE /alumni-record/:recordId` - Delete alumni record (requires college auth)

### Student Routes (`/api/student`)

#### Secure Registration Flow
- `POST /send-otp` - Send verification OTP to email
- `POST /verify-otp-register` - Verify OTP and complete registration

#### Legacy Routes
- `POST /register` - Direct registration (legacy)
- `POST /login` - Student login
- `GET /` - Get all students (requires auth)

### Alumni Routes (`/api/alumni`)
- `POST /register` - Alumni registration
- `POST /login` - Alumni login
- `GET /` - Get all alumni (requires auth)

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Email Configuration (for OTP)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password

# Super Admin (optional - defaults provided)
SUPER_ADMIN_EMAIL=admin@alumnet.com
SUPER_ADMIN_PASSWORD=admin123

# Port
PORT=5000
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Super Admin
```bash
node createSuperAdmin.js
```

### 3. Start the Server
```bash
npm run server
```

## Registration Flow

### For Students/Alumni:
1. User enters email on registration page
2. System checks if email exists in college records
3. If found, OTP is sent to email
4. User enters OTP and additional details
5. Account is created with appropriate role

### For Colleges:
1. Super admin registers college (initially unapproved)
2. Super admin approves college
3. College can login and access dashboard
4. College uploads student/alumni records

## Security Features

- **JWT Authentication** for all protected routes
- **Password Hashing** using bcrypt
- **Email Verification** via OTP
- **Role-based Access Control**
- **College Approval System**
- **Record Validation** before registration

## Error Handling

All endpoints include proper error handling with appropriate HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## File Structure

```
Backend/
├── config/
│   ├── connectDB.js
│   ├── cloudinary.js
│   └── storage.js
├── Controller/
│   ├── AdminController.js
│   ├── CollegeController.js
│   ├── StudentController.js
│   ├── AlumniController.js
│   └── userController.js
├── middlewares/
│   ├── authAdmin.js
│   ├── authCollege.js
│   └── authUser.js
├── Models/
│   ├── Admin.js
│   ├── College.js
│   ├── StudentRecord.js
│   ├── AlumniRecord.js
│   ├── StudentModel.js
│   └── AlumniModel.js
├── Routes/
│   ├── AdminRoute.js
│   ├── CollegeRoute.js
│   ├── StudentRoute.js
│   └── AlumniRoute.js
├── server.js
├── socketServer.js
├── createSuperAdmin.js
└── package.json
```

# Deployment (Docker)

## Build and Run with Docker

1. Build the Docker image:
   ```bash
   docker build -t alumnet-backend .
   ```
2. Run the container:
   ```bash
   docker run -d --env-file .env -p 5000:5000 alumnet-backend
   ```

## Environment Variables
- Copy `.env.example` to `.env` and fill in your values before running.

## Notes
- Make sure your MongoDB and other services are accessible from the container.
- Set `NODE_ENV=production` in your `.env` for production deployments. 