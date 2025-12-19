const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

// FIX 1: Point directly to users.json in the root folder (removes 'data' folder requirement)
const usersFilePath = path.join(__dirname, "../data/users.json");

class User {
  // Helper: Read the file fresh every time
  static _getUsers() {
    try {
      if (!fs.existsSync(usersFilePath)) return [];
      const data = fs.readFileSync(usersFilePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading users file:", error);
      return [];
    }
  }

  // Helper: Save data back to file
  static _saveUsers(users) {
    try {
      fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    } catch (error) {
      console.error("Error saving users file:", error);
    }
  }

  static async findById(id) {
    const users = this._getUsers();
    // FIX 2: Use loose equality (==) to match string "1" with number 1
    return users.find((u) => u.id == id);
  }

  static async findByUsername(username) {
    const users = this._getUsers();
    return users.find((u) => u.username === username);
  }

  static async validatePassword(user, password) {
    return await bcrypt.compare(password, user.password);
  }

  static getAllUsers() {
    return this._getUsers();
  }

  // --- THE CORE XP UPDATE LOGIC ---
  static async updateGamificationProgress(
    userId,
    newLevel,
    newXP,
    completedTasks
  ) {
    const users = this._getUsers();
    const index = users.findIndex((u) => u.id == userId);

    if (index !== -1) {
      // Update fields
      users[index].level = newLevel;
      users[index].experiencePoints = newXP;
      users[index].completedTasks = completedTasks;

      // Persist to file immediately
      this._saveUsers(users);
      return true;
    }
    return false;
  }
}

// FIX 3: Export the Class directly (Static methods)
module.exports = User;
