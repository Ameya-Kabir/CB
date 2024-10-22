const register = async (req, res) => {
  const { username, email, password } = req.body;
  const hash = bcrypt.hashSync(password, 10);
  try {
    const [user] = await db("users")
      .insert({ username, password: hash })
      .returning("*");
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

if (results.length > 0) {
  const user = results[0];
  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );
    return res.json({ status: "success", token: token });
  } else {
    return res.json({ status: "error", error: "Invalid credentials" });
  }
} else {
  return res.json({ status: "error", error: "Invalid credentials" });
}
