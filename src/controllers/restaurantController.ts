import {Request, Response } from "express";
import {T} from "../libs/types/common";
import MemberService from "../models/Member.service";
import { AdminRequest, LoginInput, MemberInput } from "../libs/types/member";
import {MemberType} from "../libs/enums/member.enum";
import { Message } from "../libs/Errors";

const memberService = new MemberService();
const restaurantController: T  = {};
restaurantController.goHome = (req:Request, res: Response) => {
  try {
    console.log('goHome');
    res.render("home");
    // send, json, redirect, end reender lar ham bor responce orniga
  } catch(err) {
    console.log("Error, goHome:", err)
  } 
};

restaurantController.getSignup = (req:Request, res: Response) => {
  try {
    res.render("signup");
  } catch(err) {
    console.log("Error, getSignup:", err)
  } 
};

restaurantController.getLogin = (req:Request, res: Response) => {
  try {
    console.log('getLogin');
    res.render("login");
  } catch(err) {
    console.log("Error, getLogin:", err)
  } 
}

restaurantController.processSignup = async (
  req:AdminRequest, 
  res: Response
) => {
  try {
    console.log("processSignup");

    const newMember:MemberInput = req.body;
    newMember.memberType = MemberType.RESTAURANT;


    const result = await memberService.processSignup(newMember);

    req.session.member = result;
    req.session.save(function() {
      res.send(result);
    });

  } catch(err) {
    console.log("Error, processLogin:", err)
    res.send(err);
  } 
};

restaurantController.processLogin = async (
  req:AdminRequest, 
  res: Response
) => {
  try {
    console.log("processLogin");
    const input:LoginInput = req.body;
   const result = await memberService.processLogin(input);
    req.session.member = result;
    req.session.save(function() {
      res.send(result);
    });
  /// 1.1 dan kelgan natujani front end ga jonatib yuboryopmiz.
  } catch(err) {
    console.log("Error, processLogin:", err)
    res.send(err);
  } 
};


restaurantController.checkAuthSession = async (
  req:AdminRequest, 
  res: Response
) => {
  try {
    console.log("checkAuthSession");
    if(req.session?.member) res.send(`Hi, ${req.session.member.memberNick}`);
    else res.send(`<script> alert ("${Message.NOT_AUTHENTICATED}")</script>`)
  /// 1.1 dan kelgan natujani front end ga jonatib yuboryopmiz.
  } catch(err) {
    console.log("Error, checkAuthSession:", err)
    res.send(err);
  } 
};

export default restaurantController; 