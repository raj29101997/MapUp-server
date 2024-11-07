import express from 'express';
import { User } from '../models/models.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
const router = express.Router();
dotenv.config();
const {JWT_SECRET} = process.env;

router.post('/register', async (req, res) => {
    try {
        const { userID, username, email, password, roles, } = req.body.body;
        const action = req.body.action;
        if (action === 'register') {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists', status: 401 });
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const user = new User({
                username,
                email,
                password: hashedPassword,
                roles: roles,
            });

            await user.save();
            res.status(201).json({ message: 'User registered successfully', status: 201 });
        } else if (action === 'UpdateUser') {
            const user = ({
                username,
                email,
                password,
                roles,
            });
             await User.findOneAndUpdate({ "_id": userID }, user)

            res.status(201).json({ message: 'User updated successfully', status: 201 });
        } else if (action === 'DeleteUser') {
            const user = ({
                username,
                email,
                password,
                roles,
            });
            await User.findOneAndDelete({ "_id": userID }, user)
            res.status(201).json({ message: 'User deleted successfully', status: 201 });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', status: 401 });
    }
});

router.post('/login', async (req, res) => {
   let accessData = {
        sidebar: {
            Admin: [
                { label: 'Dashboard', path: '/dashboard' },
                { label: 'User Management', path: '/user-lists' },
                { label: 'Trip Data', path: '/data-lists' },
                { label: 'Upload Data', path: '/upload' }
            ],
            Manager: [
                { label: 'Dashboard', path: '/dashboard' },
                { label: 'Trip Data', path: '/data-lists' },
            ],
            User: [
                { label: 'Dashboard', path: '/dashboard' }
            ]
        }
    }
    try {
        const { email, password } = req.body.body;
        const checkEmail = await User.findOne({ email });
        if (!checkEmail) {
            return res.status(400).json({ message: 'User not found', status: 401 });
        }
        const comparePassword = await bcrypt.compare(password, checkEmail.password);
        if (!comparePassword) {
            return res.status(401).json({ message: 'Invalid credentials', status: 401 });
        }
        const token = jwt.sign({
            data: checkEmail.username
        }, JWT_SECRET, { expiresIn: '1h' });
        const getRoles = checkEmail.roles;
        const getAccessData = accessData.sidebar[getRoles];

        const roleAndAccess = {
            role: getRoles,
            access: getAccessData
        }
        res.status(201).json({ message: 'Login successfully', roleAndAccess: roleAndAccess, token: token, status: 201 });
    } catch (error) {
        res.status(500).json({ message: 'Server error', status: 500 });
    }
})

export default router