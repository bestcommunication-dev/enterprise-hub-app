# **App Name**: Enterprise Hub

## Core Features:

- Login Authentication: Secure login system with role-based access control (Admin, Back-Office, Agent).
- Dashboard: Display a summary of key metrics and recent activities tailored to the user's role.
- Client Management: CRUD operations for managing client data. Allow Back-Office and Admin to create new customers and update all the existing clients. Agent may view, but can not edit, customers.
- Contract Management: Create, read, update, and delete contracts, with proper permissions based on roles. Allow Back-Office and Admin to create and update contract's terms.
- Commission Tracking: Track commissions earned by agents, generate reports. Allow back office to flag commissions. Allow Admins to view any commission.
- Role Based Access: Database contains entities of `user`, `roles`, and `permissions`. Each user is assigned one role. A role has zero or many permissions.
- AI-Powered Insights Tool: LLM using available data to assist decision making, suggest process optimization strategies, and highlight trends. The tool should take into account various data from all the sectors of the business to show trends.

## Style Guidelines:

- Primary color: Navy blue (#FF6004) to convey trust and professionalism.
- Background color: Light gray (#333334) to provide a clean and modern canvas.
- Accent color: Teal (#F0F2F4) for highlighting key actions and interactive elements.
- Font: 'Inter' sans-serif for a modern, readable UI. Use for headlines and body.
- Simple, clear icons from a consistent set (e.g., Font Awesome or Material Design) for navigation and actions.
- Clean, grid-based layout for consistent content arrangement across all sections.
- Subtle transitions and animations to enhance user interaction and provide visual feedback.