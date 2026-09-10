package com.guessnumber.guess_number;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin
@RestController
public class GuessController {

    private int secretNumber = (int)(Math.random() * 20) + 1;

    @GetMapping("/api/guess")
    public String guess(@RequestParam int number) {

        if (number > secretNumber) {
            return "Too High";
        }
        else if (number < secretNumber) {
            return "Too Low";
        }
        else {
            return "Correct!";
        }
    }
}