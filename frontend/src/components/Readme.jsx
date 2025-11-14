import React from "react";

const Readme = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Project Readme</h1>

      <section style={styles.section}>
        <h2 style={styles.heading}>👤 Developer Information</h2>
        <p><strong>Name:</strong> MD. Rayhan Hossain</p>
        <p><strong>Email:</strong> mostafaizurrahman2021@gmail.com</p>
        <p>
          <strong>GitHub:</strong>{" "}
          <a href="https://github.com/mdrayhan03" target="_blank" rel="noreferrer">
            mdrayhan03
          </a>
        </p>
        <p>
          <strong>Docker Hub:</strong>{" "}
          <a href="https://hub.docker.com/u/mdrayhan03" target="_blank" rel="noreferrer">
            mdrayhan03
          </a>
        </p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.heading}>🛠 Tech Stack</h2>
        <ul style={styles.ul}>
          <li>ReactJS (Frontend)</li>
          <li>FastAPI (Backend)</li>
          <li>Supabase (Database)</li>
          <li>Docker (Containerized Build)</li>
          <li>Render (Hosting for Backend/Frontend)</li>
        </ul>
      </section>

      <section style={styles.section}>
        <h2 style={styles.heading}>📥 How to Run This Project</h2>

        <h3>🔧 Clone the project and run locally:</h3>
        <pre style={styles.codeBox}>
{`git clone https://github.com/mdrayhan03/FullStackTest.git
cd FullStackTest

# Frontend
cd frontend
npm install
npm start

# Backend
cd ../backend
pip install -r requirements.txt
uvicorn app.main:app --reload
`}
        </pre>

        <h3>🐳 Run with Docker:</h3>
        <pre style={styles.codeBox}>
{`docker pull mdrayhan03/YOUR_DOCKER_IMAGE
docker run -p 8000:8000 mdrayhan03/YOUR_DOCKER_IMAGE`}
        </pre>
      </section>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "30px",
    fontFamily: "Arial, sans-serif",
    lineHeight: "1.6",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  section: {
    marginBottom: "25px",
    padding: "15px",
    background: "#f8f8f8",
    borderRadius: "8px",
  },
  heading: {
    marginBottom: "10px",
    color: "#333",
  },
  ul: {
    marginLeft: "20px",
  },
  codeBox: {
    background: "#222",
    color: "#fff",
    padding: "15px",
    borderRadius: "6px",
    overflowX: "auto",
  },
};

export default Readme;