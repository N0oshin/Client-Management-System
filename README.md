## Client Management System (CMS)

A full-stack application for managing clients, products, and order placement, powered by an Advanced Role-Based Access Control (RBAC) system that ensures user permissions and secure data operations.

---

### Project Overview

The Client Management System (CMS) streamlines business operations by enabling users (e.g., Sales Representatives) to manage clients, products, and transactions efficiently.  
At its core, it implements granular authorization control, ensuring every user action aligns with their assigned role permissions.


| Feature | Implementation | 
|----------|----------------|
| **Core Feature** | Advanced RBAC / Authorization(Permission checks on every API route) |   
| **Orders** | Transactional Dual-Payment System | 
| **Data Entities** | Clients, Products, Comments (Full CRUD for all entities)|
| **Technology** | Full-Stack, RESTful API  (React + Node.js + PostgreSQL) |


-----


###  Technology Stack

| Component | Technology | 
|------------|-------------|
| **Frontend** | React.js  |
| **Backend** | Node.js / Express|
| **Database** | PostgreSQL  |
| **Security** | JWT / bcrypt |

--

###  Advanced Role-Based Authorization (RBAC)

Authorization is enforced at the middleware level for every API endpoint, ensuring that only users with valid permissions can access specific features.

###  Screenshots
#### Login page
<img width="1920" height="986" alt="Screenshot (85)" src="https://github.com/user-attachments/assets/1deca513-e045-4d96-99af-356839c931fa" />

#### User Registration
<img width="1920" height="932" alt="Screenshot (93)" src="https://github.com/user-attachments/assets/bf3ace29-bd72-4e01-9b70-8b7c7d7b553a" />

#### Admin accessible pages
1. ClientList with CRUD operations
   <img width="1920" height="987" alt="image" src="https://github.com/user-attachments/assets/b2014d1c-cc28-444e-8d6e-00e0d9877a81" />

2. Product List with CRUD operations
   <img width="1920" height="980" alt="image" src="https://github.com/user-attachments/assets/7765877a-5a58-450e-95b9-3f0980d1af4d" />

3. Orders
   <img width="1233" height="657" alt="image" src="https://github.com/user-attachments/assets/c9d3dc86-862d-496d-8020-05d944aeba63" />

4. Comments List with CRUD operations
   <img width="1165" height="580" alt="image" src="https://github.com/user-attachments/assets/2abf9739-fced-44bf-b731-85fe507b20ff" />

#### User accessible pages
1. Client List with CREATE/READ/UPDATE
   <img width="1161" height="580" alt="image" src="https://github.com/user-attachments/assets/4e3f92d0-a024-413b-8d49-e033e92c50d5" />
2. Product List with READ
   <img width="1159" height="555" alt="image" src="https://github.com/user-attachments/assets/8c1748a4-9a79-4f5f-9a55-da3271175473" />

3. Order Creation
  <img width="1147" height="629" alt="image" src="https://github.com/user-attachments/assets/0397e344-af4b-4044-9496-95900ddd4186" />

4. Comments READ
   <img width="1166" height="582" alt="image" src="https://github.com/user-attachments/assets/52757e9d-32c7-42c3-8546-918cc4a198f3" />

   




   



