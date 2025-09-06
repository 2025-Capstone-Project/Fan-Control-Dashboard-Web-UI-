document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소 참조
    const cpuTempElem = document.getElementById('cpuTemp');
    const gpuTempElem = document.getElementById('gpuTemp');
    const modelResultElem = document.getElementById('modelResult');
    const setFanPwmElem = document.getElementById('setFanPwm');
    const actualFanPwmElem = document.getElementById('actualFanPwm');

    const controlModeSelect = document.getElementById('controlMode');
    const manualPwmControlDiv = document.getElementById('manualPwmControl');
    const pwmSlider = document.getElementById('pwmSlider');
    const pwmValueSpan = document.getElementById('pwmValue');
    const applyPwmButton = document.getElementById('applyPwm');

    // --- 초기 데이터 설정 (임의의 값) ---
    let currentSetPwm = 50; // 초기 설정 PWM
    let currentActualPwm = 55; // 초기 실제 PWM
    let currentCpuTemp = 45;
    let currentGpuTemp = 60;
    let currentModelResult = 0; // 0: 정상, 1: 비정상

    const updateDisplay = () => {
        cpuTempElem.textContent = `${currentCpuTemp} °C`;
        gpuTempElem.textContent = `${currentGpuTemp} °C`;
        modelResultElem.textContent = currentModelResult === 0 ? 'Normal (0)' : 'Abnormal (1)';
        modelResultElem.style.color = currentModelResult === 0 ? '#27ae60' : '#e74c3c'; // 색상으로 상태 표시
        setFanPwmElem.textContent = `${currentSetPwm} %`;
        actualFanPwmElem.textContent = `${currentActualPwm} %`;
        pwmValueSpan.textContent = `${pwmSlider.value}%`;
    };

    // --- 데이터 시뮬레이션 (InfluxDB/Grafana 연동 대체) ---
    const simulateData = () => {
        // CPU, GPU 온도 랜덤 변화
        currentCpuTemp = Math.floor(Math.random() * (60 - 30 + 1)) + 30; // 30-60°C
        currentGpuTemp = Math.floor(Math.random() * (60 - 40 + 1)) + 40; // 40-75°C

        // Model Result는 가끔 비정상으로 변경
        if (currentCpuTemp < 50 || currentGpuTemp < 50) { // 클러스터링된 기준값 기준 시뮬.
            currentModelResult = 0;
        } else {
            currentModelResult = 1;
        }

        // 자동 모드일 때 PWM 자동 조절 시뮬레이션 (온도에 따라)
        if (controlModeSelect.value === 'auto') {
            const avgTemp = (currentCpuTemp + currentGpuTemp) / 2;
            if (avgTemp > 65) {
                currentSetPwm = Math.min(100, currentSetPwm + 5);
            } else if (avgTemp < 40) {
                currentSetPwm = Math.max(0, currentSetPwm - 5);
            } else {
                // 중간 온도에서는 현재 PWM 유지하거나 미세 조정
                currentSetPwm = Math.min(100, Math.max(0, currentSetPwm + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3)));
            }
            // 실제 PWM은 설정 PWM에 약간의 노이즈 추가
            currentActualPwm = Math.min(100, Math.max(0, currentSetPwm + Math.floor(Math.random() * 10) - 5));
        } else {
            // 수동 모드에서는 설정 PWM은 사용자가 설정한 값, 실제 PWM은 그 값에 노이즈
            currentSetPwm = parseInt(pwmSlider.value);
            currentActualPwm = Math.min(100, Math.max(0, currentSetPwm + Math.floor(Math.random() * 5) - 2)); // 실제 PWM은 설정값에 +/- 2 오차
        }


        updateDisplay();
    };

    // 2초마다 데이터 업데이트 시뮬레이션
    setInterval(simulateData, 2000);

    // --- Fan 제어 로직 ---

    // 제어 모드 변경 시
    controlModeSelect.addEventListener('change', (event) => {
        if (event.target.value === 'manual') {
            manualPwmControlDiv.style.display = 'flex';
            applyPwmButton.style.display = 'block';
            // 수동 모드 전환 시 현재 실제 PWM 값을 슬라이더에 반영
            pwmSlider.value = currentSetPwm;
            pwmValueSpan.textContent = `${pwmSlider.value}%`;
        } else {
            manualPwmControlDiv.style.display = 'none';
            applyPwmButton.style.display = 'none';
        }
    });

    // PWM 슬라이더 값 변경 시
    pwmSlider.addEventListener('input', (event) => {
        pwmValueSpan.textContent = `${event.target.value}%`;
    });

    // 'Apply PWM' 버튼 클릭 시 (수동 모드에서)
    applyPwmButton.addEventListener('click', () => {
        if (controlModeSelect.value === 'manual') {
            const newPwm = parseInt(pwmSlider.value);
            currentSetPwm = newPwm; // 사용자가 설정한 PWM 값 적용
            alert(`Fan PWM set to ${newPwm}% (Manual Mode)`);
            updateDisplay(); // 즉시 화면 업데이트
        }
    });

    // 초기 화면 업데이트 및 초기 모드 설정
    updateDisplay();
    controlModeSelect.dispatchEvent(new Event('change')); // 초기 모드에 따라 UI 조정
});