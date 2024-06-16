import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs"
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {

    await dbConnect(); // Connect with database.

    try {
        
        const {username, email, password} = await request.json();

        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        });

        if(existingUserVerifiedByUsername){
            return Response.json({
                success: false, // It means that the username you are trying to use to create an account already exists, so no one else can take that username. That's why ' success: false '.
                message: "Username is already taken"
            }, {status: 400})
        }


        const existingUserVerifiedByEmail = await UserModel.findOne({email}); // Finding user on the basis of email

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if(existingUserVerifiedByEmail){

            if(existingUserVerifiedByEmail.isVerified){
                return Response.json({
                    success: false,
                    message: "User already exist with this email"
                }, {status: 400})

            }else{ // It is possible that an existing user has forgotten their password, so they should be allowed to set a new password.
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUserVerifiedByEmail.password = hashedPassword; 
                existingUserVerifiedByEmail.verifyCode = verifyCode;
                existingUserVerifiedByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
                await existingUserVerifiedByEmail.save();
            }

        }else{ // If the user's email isn't found in the existing records, it means they are visiting the website for the first time and need to be registered in the database.

            const hashedPassword = await bcrypt.hash(password, 10);

            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            // create new user model.
            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            });
            await newUser.save(); // Save the new user in database.

        }

        // Send verification email.
        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        );

        if(!emailResponse.success){
            return Response.json({
                success: false,
                message: emailResponse.message
            }, {status: 500});
        }

        return Response.json({
            success: true,
            message: "User registered successfully. Please verify your email"
        }, {status: 201});

    } catch (error) { 

        console.error('Error registering user', error);
        return Response.json(
            {
                success: false,
                message: "Error registering user"
            },
            {
                status: 500
            }
        )

    }

}