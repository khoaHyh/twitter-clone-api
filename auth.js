const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const User = require("./models/user");
const Filter = require("bad-words");
const filter = new Filter();

filter.addWords("badword");

module.exports = (passport) => {
  // Convert object contents into a key
  passport.serializeUser((user, done) => done(null, user._id));

  // Convert key into original object and retrieve object contents
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      if (err) return done(err);
      done(null, user);
    });
  });

  // Define process to use when a user registers
  passport.use(
    "register",
    new LocalStrategy(async (username, password, done) => {
      try {
        let trimUsername = username.trim();

        if (filter.isProfane(username)) {
          return done(null, false, {
            message: "Username must not contain profanity.",
          });
        } else if (trimUsername.length >= 50) {
          return done(null, false, {
            message: "Username cannot be longer than 50 characters.",
          });
        }

        let user = await User.findOne({ username: trimUsername });

        // If a user document exists then the username is taken
        if (user) {
          console.log(`Username '${trimUsername}' is taken.`);
          return done(null, false, {
            message: `Username '${trimUsername}' is taken.`,
          });
        }

        // Hash password before saving it in database
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert user into the database
        user = await User.create({
          username: trimUsername,
          password: hashedPassword,
        });
        return done(null, user, {
          message: `User ${trimUsername} successfully registered!`,
        });
      } catch (error) {
        console.log("passport register error:", error);
        done(error);
      }
    })
  );

  // Define process to use when we try to authenticate someone locally
  passport.use(
    "login",
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ username: username });
        console.log("User " + username + " attempted to log in.");

        // If no user is found with that username
        if (!user) {
          console.log(`User ${username} doesn't exist.`);
          return done(null, false, {
            message: "Invalid username or password.",
          });
        }

        const validated = await bcrypt.compare(password, user.password);

        // If the password provided is incorrect
        if (!validated) {
          console.log("Invalid password");
          return done(null, false, {
            message: "Invalid username or password.",
          });
        }

        return done(null, user, {
          message: `${username} logged in successfully.`,
        });
      } catch (error) {
        console.log("passport login error:", error);
        return done(error);
      }
    })
  );
};
