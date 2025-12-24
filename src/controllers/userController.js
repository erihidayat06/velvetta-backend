import userService from '../services/userService.js';

class UserController {
  async register(req, res) {
    try {
      const result = await userService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async login(req, res) {
    try {
      console.log('============>', req.body)
      const { email, password } = req.body;
      const result = await userService.login(email, password);
      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      console.log(error)
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  async getProfile(req, res) {
    try {
      const user = await userService.getProfile(req.user.id);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async updatePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      await userService.updatePassword(req.user.id, currentPassword, newPassword);
      res.json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateUserVvip(req, res) {
    try {
      const { userId } = req.params;
      const { vvip } = req.body;
      const user = await userService.updateUserVvip(userId, vvip);
      res.json({
        success: true,
        message: 'User VVIP status updated',
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAll(req, res) {
    try {
      const users = await userService.getAll();
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get users'
      });
    }
  }
}

export default new UserController();

