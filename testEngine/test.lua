-- Test Engine Lua Script
-- This script contains various functions to test Lua functionality

-- Basic calculator functions
function add(a, b)
    return a + b
end

function subtract(a, b)
    return a - b
end

function multiply(a, b)
    return a * b
end

function divide(a, b)
    if b == 0 then
        return "Error: Division by zero"
    end
    return a / b
end

-- String manipulation functions
function reverse_string(str)
    return str:reverse()
end

function count_words(str)
    local count = 0
    for word in str:gmatch("%S+") do
        count = count + 1
    end
    return count
end

-- File operations
function read_file(filename)
    local file = io.open(filename, "r")
    if not file then
        return "Error: Could not open file"
    end
    local content = file:read("*all")
    file:close()
    return content
end

function write_file(filename, content)
    local file = io.open(filename, "w")
    if not file then
        return "Error: Could not open file"
    end
    file:write(content)
    file:close()
    return "File written successfully"
end

-- Test the functions
print("Calculator Test:")
print("2 + 3 =", add(2, 3))
print("5 - 2 =", subtract(5, 2))
print("4 * 6 =", multiply(4, 6))
print("10 / 2 =", divide(10, 2))

print("\nString Test:")
local test_str = "Hello World"
print("Original:", test_str)
print("Reversed:", reverse_string(test_str))
print("Word count:", count_words(test_str)) 