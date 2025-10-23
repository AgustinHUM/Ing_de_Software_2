"""
Tests básicos para verificar que pytest funciona
"""
import pytest


@pytest.mark.unit
def test_basic_math():
    """Test básico de matemáticas"""
    assert 2 + 2 == 4
    assert 3 * 3 == 9


@pytest.mark.unit
def test_string_operations():
    """Test básico de strings"""
    text = "Hello World"
    assert "Hello" in text
    assert len(text) == 11


@pytest.mark.unit
def test_list_operations():
    """Test básico de listas"""
    numbers = [1, 2, 3, 4, 5]
    assert len(numbers) == 5
    assert 3 in numbers
    assert max(numbers) == 5
