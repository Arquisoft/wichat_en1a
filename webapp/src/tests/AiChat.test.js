import React from "react";
import axios from "axios";
import MockAdapter from 'axios-mock-adapter';
import AiChat from "../components/AiChat";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockAxios = new MockAdapter(axios);
describe('AiChat component', () => {
  beforeEach(() => {
    mockAxios.reset();
  });

  const userInput = "Can you give me a hint?";
  const aiChatAnswer="Aichat answer";

  it('should display a question made and its response',async ()=>{
    render(<AiChat/>);
    
    mockAxios.onPost('http://localhost:8000/askllm').reply(200,{answer:aiChatAnswer})

    //open drawer
    fireEvent.click(screen.getByTestId("aiChatFloatingButton"));

    await waitFor(()=>{
        expect(screen.getByTestId("aiChatUserInput")).toBeInTheDocument();
    })

    fireEvent.change(screen.getByPlaceholderText("Type a message..."),{target:{value:userInput}});
    fireEvent.click(screen.getByTestId("aiChatSendButton"));
    
    await waitFor(() => {
      expect(screen.getByText(new RegExp(userInput))).toBeInTheDocument();
    });
    await waitFor(()=>{
        expect(screen.getByText(new RegExp(aiChatAnswer))).toBeInTheDocument();
    })
  })

});