# Aquarian Pool and Spa - Web Application

A production-ready web application for a swimming pool sales & construction company, built with Node.js, Express, MongoDB, and EJS templating.

## Features

### Public Site
- **Landing Page** with customizable hero section (text or image)
- **Portfolio** showcase with list and detail pages
- **Products** catalog with list and detail pages
- **Contact Form** with email notifications
- **Responsive Design** using Bootstrap 5
- **Theme Customization** with 5 preset water-inspired themes or custom colors

### Admin CMS
- **Secure Authentication** with session management
- **Dashboard** with quick stats
- **Contacts Management** - view and manage form submissions
- **Products CRUD** - create, edit, delete products
- **Portfolio CRUD** - create, edit, delete portfolio posts
- **Media Library** - upload up to 20 images at once with progress bars
  - Automatic image processing into 3 sizes (large, medium, thumb)
  - Image compression and optimization
- **Settings Management** - configure company info, hero section, logo, social links, and themes

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Templating**: EJS with layouts and partials
- **UI Framework**: Bootstrap 5
- **Security**: Helmet, express-validator, bcryptjs
- **Image Processing**: Sharp (resizing and compression)
- **File Upload**: Multer
- **Email**: Nodemailer (SMTP)
- **Other**: dotenv, compression, morgan

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- SMTP email account (Gmail, etc.)

### Steps

1. **Clone or download the project**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your settings:
   ```env
   # Server
   PORT=3000
   NODE_ENV=development
   
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/aquarian-pool-spa
   
   # Admin Credentials
   ADMIN_EMAIL=admin@aquarianpoolandspa.com
   ADMIN_PASSWORD=your-secure-password
   
   # Session Secret (generate a random string)
   SESSION_SECRET=your-super-secret-session-key-change-this-in-production
   
   # Email (Nodemailer SMTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   MAIL_TO=aquarianpoolandspa@gmail.com
   MAIL_FROM=your-email@gmail.com
   ```

4. **Seed the database**
   ```bash
   npm run seed
   ```
   
   This creates:
   - Admin user (from `ADMIN_EMAIL` and `ADMIN_PASSWORD`)
   - Default settings

5. **Start the server**
   
   Development mode (with nodemon):
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

6. **Access the application**
   - Public site: http://localhost:3000
   - Admin panel: http://localhost:3000/admin/login

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3000) |
| `NODE_ENV` | Environment (development/production) | No |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `ADMIN_EMAIL` | Admin login email | Yes |
| `ADMIN_PASSWORD` | Admin login password | Yes |
| `SESSION_SECRET` | Secret for session encryption | Yes |
| `SMTP_HOST` | SMTP server host | Yes (for email) |
| `SMTP_PORT` | SMTP server port | Yes (for email) |
| `SMTP_SECURE` | Use TLS (true/false) | Yes (for email) |
| `SMTP_USER` | SMTP username | Yes (for email) |
| `SMTP_PASS` | SMTP password/app password | Yes (for email) |
| `MAIL_TO` | Recipient email for contact form | Yes (for email) |
| `MAIL_FROM` | Sender email address | Yes (for email) |

## Creating Admin User

The admin user is automatically created when you run the seed script:

```bash
npm run seed
```

The credentials are taken from your `.env` file:
- Email: `ADMIN_EMAIL`
- Password: `ADMIN_PASSWORD`

To create additional admin users, you can use MongoDB directly or create a script.

## How Themes Work

The application supports two theme modes:

### Preset Themes
Five water-inspired preset themes:
- **Ocean Blue** - Deep blue tones
- **Deep Teal** - Teal and turquoise
- **Crystal Clear** - Light blue and clear tones
- **Midnight Blue** - Dark blue shades
- **Tropical Turquoise** - Bright turquoise

### Custom Theme
Set your own colors:
- Primary Color
- Secondary Color
- Background Color
- Text Color
- Accent Color

Themes are applied site-wide using CSS variables and are stored in the database. You can change themes from the Admin Settings page.

## Media Storage

### How It Works

1. **Upload**: Images are uploaded via the Media Library (up to 20 at once)
2. **Processing**: Each image is automatically processed into 3 sizes:
   - **Large**: Max width 1600px (for full-size displays)
   - **Medium**: Max width 900px (for cards and previews)
   - **Thumb**: Max width 400px (for thumbnails)
3. **Storage**: Images are stored in MongoDB as binary data (MediaStorage collection)
4. **Compression**: JPEG compression is applied (quality 80-85%)
5. **Metadata**: Original filename, mime type, dimensions, and file size are stored

### Image Sizes

- **Thumb**: Used in admin grids, media pickers
- **Medium**: Used in product/portfolio cards, list pages
- **Large**: Used in detail pages, hero images

### Accessing Images

Images are served via:
```
/admin/media/image/{mediaId}/{size}
```

Where `size` is: `thumb`, `medium`, or `large`

## Project Structure

```
ppsgLandingPage/
├── models/              # Mongoose models
│   ├── Admin.js
│   ├── ContactSubmission.js
│   ├── Media.js
│   ├── MediaStorage.js
│   ├── PortfolioPost.js
│   ├── Product.js
│   └── Setting.js
├── routes/              # Express routes
│   ├── admin/           # Admin routes
│   │   ├── contacts.js
│   │   ├── media.js
│   │   ├── portfolio.js
│   │   ├── products.js
│   │   └── settings.js
│   ├── admin.js         # Admin main routes
│   └── public.js        # Public routes
├── views/               # EJS templates
│   ├── admin/           # Admin views
│   ├── errors/          # Error pages
│   ├── layouts/         # Layout templates
│   ├── partials/        # Reusable partials
│   └── public/          # Public views
├── middleware/          # Custom middleware
│   └── auth.js
├── services/            # Business logic
│   ├── emailService.js
│   └── mediaService.js
├── public/              # Static assets
│   ├── css/
│   └── js/
├── scripts/             # Utility scripts
│   └── seed.js
├── server.js            # Main application file
├── package.json
└── README.md
```

## Development

### Running in Development Mode

```bash
npm run dev
```

Uses nodemon for auto-restart on file changes.

### Database Models

- **Setting**: Site configuration, theme, company info
- **ContactSubmission**: Contact form submissions
- **Product**: Product catalog items
- **PortfolioPost**: Portfolio/project posts
- **Media**: Media metadata
- **MediaStorage**: Binary image data
- **Admin**: Admin user accounts

### Adding New Features

1. Create models in `models/`
2. Add routes in `routes/`
3. Create views in `views/`
4. Add any necessary middleware in `middleware/`

## Production Deployment

### Before Deploying

1. Set `NODE_ENV=production` in `.env`
2. Use a strong `SESSION_SECRET`
3. Use a production MongoDB instance
4. Configure production SMTP settings
5. Update admin credentials
6. Test all functionality

### Security Considerations

- Change default admin password
- Use HTTPS in production
- Set secure session cookies
- Validate all user inputs
- Limit file upload sizes
- Use environment variables for secrets

## Troubleshooting

### MongoDB Connection Issues
- Verify `MONGODB_URI` is correct
- Ensure MongoDB is running
- Check network/firewall settings

### Email Not Sending
- Verify SMTP credentials
- For Gmail, use an App Password (not regular password)
- Check SMTP port and security settings
- Verify `MAIL_TO` and `MAIL_FROM` are set

### Image Upload Fails
- Check file size limits (max 10MB per file)
- Verify file type (images only)
- Check MongoDB storage capacity
- Review server logs for errors

### Admin Login Issues
- Run seed script to create admin user
- Verify `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`
- Check session configuration

## License

ISC

## Support

For issues or questions, please contact the development team.

