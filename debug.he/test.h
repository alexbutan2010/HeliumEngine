@variables
test-color = "#ff6b6b"
test-size = "1.5rem"

@components
nitrogen-test {
    background: var(test-color);
    color: white;
    padding: var(test-size);
    border-radius: 10px;
    border: none;
    cursor: pointer;
    hover: transform: scale(1.05); background: "#ff5252";
    ai: predict = true;
}

@animations
test-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
    duration: 1s;
    infinite: true;
}

@logic
on load {
    nitrogen.console.log('✅ Nitrogen test file loaded successfully!');
}
