import React from 'react';
import GameComponent from '../components/GameComponent';
import { render, screen } from '@testing-library/react';

describe('Game Component', () => {

    test('if no question parameter is provided it notifies the user', async () => {
        render(<GameComponent/>);

        expect(screen.getByText("Please pass the question parameter")).toBeInTheDocument();
        expect(screen.getAllByText("No answer")).toHaveLength(4);
    });
});