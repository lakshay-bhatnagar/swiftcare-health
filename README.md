# 🏥 SwiftCare – Smart Healthcare & Medicine Delivery Platform

SwiftCare is a modern healthcare platform that enables users to order medicines, upload prescriptions, consult doctors online, and access healthcare services from the comfort of their homes. The platform is designed to provide a seamless and secure experience by integrating real-time authentication, cloud-based data storage, and an intuitive user interface.

---

## ✨ Features

### 🔐 Authentication
- Secure user authentication with Supabase
- Email and password login/signup
- Session persistence
- Protected routes
- User profile management

### 💊 Medicine Ordering
- Browse medicines by category
- Search medicines instantly
- View detailed medicine information
- Add/remove medicines from cart
- Quantity management
- Coupon support
- Secure checkout process

### 📍 Address Management
- Add multiple delivery addresses
- Edit existing addresses
- Delete saved addresses
- Set default delivery address
- Select address during checkout

### 📄 Prescription Upload
- Upload medical prescriptions
- Manage uploaded prescriptions
- Secure cloud storage
- Prescription history

### 👨‍⚕️ Doctor Consultation
- Browse available doctors
- Book online consultations
- Consultation history
- Digital healthcare support

### 📦 Order Management
- Place medicine orders
- Track order history
- View order details
- Order status updates

### 🔔 Notifications
- Real-time notifications
- Mark notifications as read
- Notification history

### 🎨 User Experience
- Responsive design
- Dark mode support
- Modern UI with Tailwind CSS
- Smooth navigation
- Pull-to-refresh support (where applicable)

---

## 🛠 Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Context API

### Backend
- Supabase
  - Authentication
  - PostgreSQL Database
  - Row Level Security (RLS)
  - Storage

### State Management
- React Context API
- React Hooks

### UI Components
- shadcn/ui
- Lucide Icons

---

## 📁 Project Structure

```text
src/
│
├── components/
│   ├── ui/
│   ├── auth/
│   ├── cart/
│   ├── doctor/
│   └── pharmacy/
│
├── context/
│   └── AppContext.tsx
│
├── pages/
│
├── services/
│   ├── address.service.ts
│   ├── order.service.ts
│   ├── notification.service.ts
│   ├── doctor.service.ts
│   └── prescription.service.ts
│
├── lib/
│   └── supabase.ts
│
├── hooks/
│
├── types/
│
├── utils/
│
└── assets/
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/lakshay-bhatnagar/swiftcare.git
```

### 2. Navigate to the Project

```bash
cd swiftcare-health
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root.

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

### 5. Start Development Server

```bash
npm run dev
```

---

## 🗄 Database

SwiftCare uses **Supabase PostgreSQL** as the backend database.

Main tables include:

- users
- medicines
- pharmacies
- addresses
- orders
- order_items
- prescriptions
- consultations
- notifications
- coupons

Authentication is handled using **Supabase Auth**, while application data is secured using **Row Level Security (RLS)** policies.

---

## 🔒 Security Features

- Secure authentication with Supabase Auth
- Session persistence
- Protected application routes
- Row Level Security (RLS)
- Secure API communication
- Input validation
- Secure prescription uploads

---

## 📸 Screenshots



---

## 📈 Future Enhancements

- 💳 Online payment integration
- 🚚 Live order tracking
- 🗺 Google Maps integration
- 🤖 AI-powered medicine recommendations
- 📹 Video doctor consultations
- 📱 Progressive Web App (PWA)
- 🌐 Multi-language support
- ⭐ Medicine reviews and ratings
- 💬 In-app customer support

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/your-feature
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push to the branch

```bash
git push origin feature/your-feature
```

5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Developer

**Lakshay Bhatnagar**

Bachelor of Technology (Computer Science & Engineering)

Cybersecurity Enthusiast | Software Developer | Healthcare Technology

GitHub: [https://github.com/lakshay-bhatnagar](https://github.com/lakshay-bhatnagar)

LinkedIn: [https://linkedin.com/in/yourprofile](https://www.linkedin.com/in/lakshay-bhatnagar/)

---

⭐ If you found this project helpful, consider giving it a **star** on GitHub!
