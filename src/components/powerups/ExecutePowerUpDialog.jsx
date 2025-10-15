import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ExecutePowerUpDialog({ powerUp, isOpen, onClose }) {
  const [inputs, setInputs] = useState({});
  const [variables, setVariables] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (powerUp) {
      const regex = /\{(.*?)\}/g;
      const foundVariables = powerUp.prompt_template.match(regex) || [];
      const uniqueVariables = [...new Set(foundVariables.map(v => v.slice(1, -1)))];
      setVariables(uniqueVariables);
      
      const initialInputs = {};
      uniqueVariables.forEach(v => {
        initialInputs[v] = '';
      });
      setInputs(initialInputs);
    }
  }, [powerUp]);

  const handleInputChange = (variable, value) => {
    setInputs(prev => ({ ...prev, [variable]: value }));
  };

  const handleSubmit = () => {
    let finalPrompt = powerUp.prompt_template;
    for (const variable in inputs) {
      const regex = new RegExp(`\\{${variable}\\}`, 'g');
      finalPrompt = finalPrompt.replace(regex, inputs[variable]);
    }
    
    // Navigate to dashboard and pass prompt in state
    navigate(createPageUrl('Dashboard'), { state: { prompt: finalPrompt } });
    onClose();
  };

  if (!powerUp) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Execute: {powerUp.name}
          </DialogTitle>
          <DialogDescription>
            Please provide the following information to run this PowerUp.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {variables.length > 0 ? (
            variables.map(variable => (
              <div key={variable} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={variable} className="text-right capitalize">
                  {variable.replace(/_/g, ' ')}
                </Label>
                <Input
                  id={variable}
                  value={inputs[variable] || ''}
                  onChange={(e) => handleInputChange(variable, e.target.value)}
                  className="col-span-3"
                  placeholder={`Enter ${variable.replace(/_/g, ' ')}...`}
                />
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center">This PowerUp requires no additional information. Ready to run!</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>
            <Zap className="w-4 h-4 mr-2" />
            Run PowerUp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}