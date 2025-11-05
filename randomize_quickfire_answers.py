#!/usr/bin/env python3
"""
Script to randomize the positions of correct answers in quickfire.md files.
Shuffles answer options (A, B, C, D) so correct answers don't always appear in position B.
"""

import re
import random
from pathlib import Path

def parse_question_block(lines, start_idx):
    """Extract a question and its four options."""
    question = {"text": "", "options": {}, "start_line": start_idx}

    # Get question text
    i = start_idx
    while i < len(lines) and not lines[i].strip().startswith("A)"):
        if lines[i].strip() and not lines[i].strip().startswith("###"):
            question["text"] += lines[i]
        i += 1

    # Get options A, B, C, D
    for option in ['A)', 'B)', 'C)', 'D)']:
        if i < len(lines) and lines[i].strip().startswith(option):
            question["options"][option[0]] = lines[i].strip()[3:].strip()  # Remove "A) " prefix
            i += 1

    question["end_line"] = i
    return question

def parse_quickfire_file(filepath):
    """Parse a quickfire.md file and extract questions and answers."""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    questions = []
    answers = {}

    # Find questions section
    in_questions = False
    in_answers = False

    for i, line in enumerate(lines):
        if line.strip() == "## Questions":
            in_questions = True
            continue
        elif line.strip() == "## Answers":
            in_answers = True
            in_questions = False
            continue
        elif line.strip() == "## Study Resources":
            in_answers = False
            break

        # Parse questions
        if in_questions and re.match(r'^###\s+\d+\.', line.strip()):
            q = parse_question_block(lines, i)
            if len(q["options"]) == 4:  # Valid question with 4 options
                questions.append(q)

        # Parse answers
        if in_answers:
            match = re.match(r'^(\d+)\.\s+\*\*([A-D])\*\*\s+-\s+(.+)', line.strip())
            if match:
                q_num = int(match.group(1))
                correct = match.group(2)
                explanation = match.group(3)
                answers[q_num] = {
                    "letter": correct,
                    "explanation": explanation,
                    "line_idx": i
                }

    return lines, questions, answers

def shuffle_question_options(question, correct_letter):
    """Shuffle the options and return new mapping."""
    # Create list of (letter, text) tuples
    options = [(letter, question["options"][letter]) for letter in ['A', 'B', 'C', 'D']]

    # Identify which option is correct
    correct_text = question["options"][correct_letter]

    # Shuffle the option texts
    option_texts = [opt[1] for opt in options]
    random.shuffle(option_texts)

    # Find new position of correct answer
    new_correct_letter = ['A', 'B', 'C', 'D'][option_texts.index(correct_text)]

    # Create new options mapping
    new_options = {letter: text for letter, text in zip(['A', 'B', 'C', 'D'], option_texts)}

    return new_options, new_correct_letter

def update_quickfire_file(filepath):
    """Randomize answer positions in a quickfire.md file."""
    print(f"Processing {filepath}...")

    lines, questions, answers = parse_quickfire_file(filepath)

    if not questions or not answers:
        print(f"  Warning: Could not parse questions or answers in {filepath}")
        return

    # Track changes for each question
    changes = {}

    for q_idx, question in enumerate(questions):
        q_num = q_idx + 1
        if q_num not in answers:
            continue

        current_correct = answers[q_num]["letter"]
        new_options, new_correct = shuffle_question_options(question, current_correct)

        # Update the question options in the lines
        line_idx = question["start_line"]
        while line_idx < question["end_line"] and line_idx < len(lines):
            line = lines[line_idx].strip()
            for letter in ['A', 'B', 'C', 'D']:
                if line.startswith(f"{letter})"):
                    # Replace with new option text
                    indent = len(lines[line_idx]) - len(lines[line_idx].lstrip())
                    lines[line_idx] = " " * indent + f"{letter}) {new_options[letter]}\n"
                    break
            line_idx += 1

        # Track the change for updating answers section
        if new_correct != current_correct:
            changes[q_num] = new_correct

    # Update answers section
    for q_num, new_letter in changes.items():
        if q_num in answers:
            line_idx = answers[q_num]["line_idx"]
            explanation = answers[q_num]["explanation"]
            # Update the answer line
            lines[line_idx] = f"{q_num}. **{new_letter}** - {explanation}\n"

    # Write back to file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(lines)

    print(f"  Updated {len(changes)} questions with new answer positions")

def main():
    """Process all quickfire.md files in the labs directory."""
    labs_dir = Path("/home/user/kubernetes-ckad/labs")
    quickfire_files = list(labs_dir.glob("*/quickfire.md"))

    print(f"Found {len(quickfire_files)} quickfire.md files")
    print()

    random.seed()  # Use system time for randomization

    for filepath in sorted(quickfire_files):
        update_quickfire_file(filepath)

    print()
    print("All files processed successfully!")

if __name__ == "__main__":
    main()
