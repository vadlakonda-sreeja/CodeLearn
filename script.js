import { doc, setDoc, increment } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged }
   from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
window.increment = increment;
// ✅ FIX: declare user
let currentUser = null;
// ✅ WAIT FOR FIREBASE
function initAuth() {
   if (!window.auth) {
      console.log("⏳ Waiting for Firebase...");
      setTimeout(initAuth, 200);
      return;
   }
   onAuthStateChanged(window.auth, (user) => {
      if (user) {
         currentUser = user;
         window.currentUser = user;
         console.log("✅ Logged in:", user.email);
      } else {
         currentUser = null;
         window.currentUser = null;
      }
   });
}
initAuth();
/*Register*/
async function register() {
   const username = document.getElementById("username").value;
   const email = document.getElementById("email").value;
   const password = document.getElementById("password").value;
   try {
      const userCredential =
         await window.createUserWithEmailAndPassword(window.auth, email, password);
      const user = userCredential.user;
      // ✅ SAVE USER IN FIRESTORE
      await window.setDoc(window.doc(window.db, "users", user.uid), {
         username: username,
         email: email,   
         solved: 0
      });
      await window.sendEmailVerification(user);
      alert("Registration success ✅ Check email for verification");
      window.location.href = "login.html";
   } catch (error) {
      alert(error.message);
   }
}
window.register = register;
//login
function login() {
   const email = document.getElementById("email").value;
   const password = document.getElementById("password").value;
   window.signInWithEmailAndPassword(window.auth, email, password)
      .then(async (userCredential) => {
         await userCredential.user.reload();
         if (!userCredential.user.emailVerified) {
            alert("Please verify your email first ✅");
            return;
         }
         alert("Login Successful 🚀");
         window.location.href = "dashboard.html";
      })
      .catch((error) => {
         alert(error.message);
      });
}
window.login = login;
async function loadChallenges() {
   const res = await fetch("challenges.json");
   const data = await res.json();
   const list = document.getElementById("challengeList");
   if (!list) return;
   list.innerHTML = "";
   data.challenges.forEach(ch => {
      const card = document.createElement("div");
      card.className = "challenge-card";
      card.innerHTML = `
       <div class="challengeInfo">
           <div class="challengeTitle">
              ${ch.title}
           </div>
           <div class="challengeMeta">
              ${ch.difficulty} • ${ch.language}
           </div>
       </div>
       <button class="solveBtn"
           onclick="openEditor(${ch.id})">
           Solve Challenge
       </button>
     `;
      list.appendChild(card);
   });
}
loadChallenges();
/*open editor*/
window.openEditor = function (id) {
   window.location.href = "editor.html?id=" + id;
}
window.completeChallenge = async function () {
   const user = window.auth.currentUser;
   if (!user) {
      alert("User not logged in!");
      return;
   }
   const userRef = window.doc(window.db, "users", user.uid);
   try {
      await window.updateDoc(userRef, {
         solved: window.increment(1)
      });
   } catch (err) {
      await window.setDoc(userRef, {
         username: user.displayName || "User",
         email: user.email,
         solved: 1
      });
   }

   alert("🔥 Challenge Completed!");
}
/*progress*/
async function loadProgress() {
   const text = document.getElementById("progressText");
   const bar = document.getElementById("progressBar");
   if (!text || !bar) return;
   const res = await fetch("challenges.json");
   const data = await res.json();
   const challenges = data.challenges;
   const total = challenges.length;
   let solved = 0;
   challenges.forEach(ch => {
      const key = "solved_" + ch.id;
      if (localStorage.getItem(key) === "true") {
         solved++;
      }
   });
   text.innerText = solved + " / " + total + " completed";
   const percent = (solved / total) * 100;
   bar.style.width = percent + "%";
}
loadProgress();
/*Badges*/
if (window.location.pathname.includes("badges.html")) {
   window.onload = async function loadBadges() {
      const badgeList = document.getElementById("badgeList");
      if (!badgeList) {
         console.log("badgeList not found");
         return;
      }
      try {
         const res = await fetch("challenges.json");
         const data = await res.json();
         const challenges = data.challenges;
         let solved = 0;
         challenges.forEach(ch => {
            if (localStorage.getItem("solved_" + ch.id)) {
               solved++;
            }
         });
         badgeList.innerHTML = "";
         function createBadge(icon, title, required) {
            const unlocked = solved >= required;
            badgeList.innerHTML += `
          <div class="badgeCard ${unlocked ? "" : "locked"}">
            <div class="badgeIcon">${icon}</div>
            <div class="badgeTitle">${title}</div>
            <p>${required} problems</p>
          </div>
        `;
         }
         createBadge("🥉", "Beginner",1);
         createBadge("🥈", "Intermediate", 5);
         createBadge("🥇", "Pro Coder", 10);
      } catch (err) {
         console.error("Error:", err);
      }
   };
}
/*leaderboard*/
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
async function loadLeaderboard() {
   const list = document.getElementById("leaderList");
   if (!list) {
      console.log("leaderList not found");
      return;
   }
   if (!window.db) {
      console.log("Firebase not ready");
      return;
   }
   try {
      const querySnapshot = await getDocs(collection(window.db, "users"));
      console.log("Docs count:", querySnapshot.size);
      let users = [];
      querySnapshot.forEach((docSnap) => {
         const data = docSnap.data();
         users.push({
            username: data.username || "Unknown",
            solved: data.solved || 0
         });
      });
      console.log("Users:", users);
      users.sort((a, b) => b.solved - a.solved);
      list.innerHTML = "";
      users.forEach((user, index) => {
         let medal = "";
         if (index === 0) medal = "🥇";
         else if (index === 1) medal = "🥈";
         else if (index === 2) medal = "🥉";
         const li = document.createElement("li");
         li.innerHTML = `
        ${medal || (index + 1)}. 
        ${user.username} - ${user.solved} solved
      `;
         list.appendChild(li);
      });
   } catch (err) {
      console.error("Leaderboard error:", err);
   }
}
if (document.getElementById("leaderList")) {
   loadLeaderboard();
}
/*editor*/
if (window.location.pathname.includes("editor.html")) {
   let challengeData;
   let challengeId = new URLSearchParams(window.location.search).get("id");
   async function loadChallenge() {
      const res = await fetch("challenges.json");
      const data = await res.json();
      console.log("URL ID:", challengeId);
      challengeData = data.challenges.find(
         c => String(c.id) === String(challengeId)
      );
      if (!challengeData) {
         console.log("❌ Challenge not found");
         return;
      }
      document.getElementById("challengeTitle").innerText =
         challengeData.title;
   }
   loadChallenge();
}
let pyodide = null;
async function initPython() {
   console.log("⏳ Waiting for Pyodide...");
   while (typeof loadPyodide === "undefined") {
      await new Promise(resolve => setTimeout(resolve, 100));
   }
   try {
      pyodide = await loadPyodide();
      console.log("✅ Pyodide loaded successfully");
   } catch (err) {
      console.error("pyodide error:", err);
   }
}
initPython();
/*submit solution*/
async function submitSolution() {
   const code = document.getElementById("codeArea").value;
   const result = document.getElementById("result");
   const language = document.getElementById("language").value;
   let output;
   result.innerText = "⏳ Running...";
   try {
      //JS
      if (language === "63") {
         output = eval(code);
      }
      //python
      else if (language === "71") {
         if (!pyodide) {
            result.innerText = "Python is loading...";
            return;
         }
         let safeCode = code.replace(/`/g, "\\`");
         output = pyodide.runPython(`
import sys
from io import StringIO
old_stdout = sys.stdout
sys.stdout = mystdout = StringIO()
${safeCode}
sys.stdout = old_stdout
mystdout.getvalue()
`) || "No output";
      }
      // Java
      else if (language === "62") {
         const response = await fetch("https://ce.judge0.com/submissions?base64_encoded=false&wait=true", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               source_code: code,
               language_id: 62
            })
         });
         const data = await response.json();
         output =
            data.stdout ||
            data.stderr ||
            data.compile_output ||
            "No output";
      }
      result.innerText = output;
   } catch (err) {
      result.innerText = "Error: " + err.message;
      return;
   }
   console.log("🔥 Firestore update running...");
   const urlParams = new URLSearchParams(window.location.search);
   const id = urlParams.get("id");
   const key = "solved_" + id;
   // ✅ Prevent duplicate solve
   if (localStorage.getItem(key) === "true") {
      alert("Already solved!");
      return;
   }
   // ✅ Save locally (for progress & badges)
   localStorage.setItem(key, "true");
   // ✅ Firebase user
   const user = window.auth.currentUser;
   console.log("User before update:", user);
   if (!user) {
      alert("User not logged in!");
      return;
   }
   const userRef = window.doc(window.db, "users", user.uid);
   try {
      await window.updateDoc(userRef, {
         solved: window.increment(1)
      });
   } catch (err) {
      // if document doesn't exist
      await window.setDoc(userRef, {
         username: user.displayName || "User",
         email: user.email,
         solved: 1
      });
   }
   console.log("✅ Firestore incremented successfully");
   alert("🔥 Challenge Completed!");
   window.location.href = "leaderboard.html";
}
window.submitSolution = submitSolution;
