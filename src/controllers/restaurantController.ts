import {Request, Response } from "express";
import {T} from "../libs/types/common";
import MemberService from "../models/Member.service";
import { LoginInput, MemberInput } from "../libs/types/member";
import {MemberType} from "../libs/enums/member.enum";

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

restaurantController.processLogin = async (req:Request, res: Response) => {
  try {
    console.log("processLogin");
    console.log("body:",req.body);
    const input:LoginInput = req.body;

    const memberService = new MemberService();
    const result = await memberService.processLogin(input);
    res.send(result);   /// 1.1 dan kelgan natujani front end ga jonatib yuboryopmiz.
  } catch(err) {
    console.log("Error, processLogin:", err)
    res.send(err);
  } 
};

restaurantController.processSignup = async (req:Request, res: Response) => {
  try {
    console.log("processSignup");
    console.log("body", req.body);

    const newMember:MemberInput = req.body;
    newMember.memberType = MemberType.RESTAURANT;

    const memberService = new MemberService();
    const result = await memberService.processSignup(newMember);

    res.send(result);
  } catch(err) {
    console.log("Error, processLogin:", err)
    res.send(err);
  } 
};

export default restaurantController; 